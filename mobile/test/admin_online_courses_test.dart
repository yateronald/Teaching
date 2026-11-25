import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/auth/token_storage.dart';
import 'package:mobile/features/admin/demo_requests/demo_detail_panel.dart';
import 'package:mobile/features/admin/online_courses/online_courses_model.dart';
import 'package:mobile/features/admin/online_courses/online_courses_screen.dart';

class _NoSession extends TokenStorage {
  @override
  Future<String?> getToken() async => null;
  @override
  Future<String?> getUserJson() async => null;
  @override
  Future<void> clearSession() async {}
}

class _FakeOnlineApi extends ApiClient {
  _FakeOnlineApi() : super(customBaseUrl: 'http://test.invalid/api');

  final sent = <String, dynamic>{};
  final queries = <String, Map<String, dynamic>?>{};

  String _mode = 'free';

  static final Map<String, dynamic> _catalog = {
    'configured': true,
    'currency': 'USD',
    'discounts': {'quarterly': 10, 'yearly': 20},
    'premium_ai_credits': 30,
    'tiers': {
      'free': {'active': true},
      'standard': {
        'active': true,
        'periods': {
          'monthly': {'code': 'standard-monthly', 'amount': 999, 'currency': 'USD', 'days': 30, 'discount_pct': 0, 'recurring': false, 'active': true},
          'quarterly': {'code': 'standard-quarterly', 'amount': 2697, 'currency': 'USD', 'days': 90, 'discount_pct': 10, 'recurring': false, 'active': true},
          'yearly': {'code': 'standard-yearly', 'amount': 9590, 'currency': 'USD', 'days': 365, 'discount_pct': 20, 'recurring': false, 'active': true},
        },
      },
      'premium': {
        'active': true,
        'periods': {
          'monthly': {'code': 'premium-monthly', 'amount': 1499, 'currency': 'USD', 'days': 30, 'discount_pct': 0, 'recurring': false, 'active': true},
          'quarterly': {'code': 'premium-quarterly', 'amount': 4047, 'currency': 'USD', 'days': 90, 'discount_pct': 10, 'recurring': false, 'active': true},
          'yearly': {'code': 'premium-yearly', 'amount': 14390, 'currency': 'USD', 'days': 365, 'discount_pct': 20, 'recurring': false, 'active': true},
        },
      },
    },
  };

  Map<String, dynamic> _billing() => {
        'mode': 'test',
        'learn_mode': _mode,
        'callback_url': 'https://api.learnfrenchwithnatives.com/api/learn/billing/callback',
        'webhook_url': 'https://api.learnfrenchwithnatives.com/api/learn/billing/webhook/paystack',
        'currencies': ['USD', 'EUR', 'CAD', 'XOF'],
        'merchant_currencies': ['XOF'],
        'fx_usd_xof': {'rate': 605.0, 'source': 'live'},
        'catalog': _catalog,
        'offers': [
          {
            'id': 1,
            'code': 'premium-monthly',
            'name_en': 'Premium — Monthly',
            'name_fr': 'Premium — Mensuel',
            'plan_tier': 'premium',
            'billing_period': 'monthly',
            'discount_pct': 0,
            'days': 30,
            'amount': 1499,
            'currency': 'USD',
            'recurring': false,
            'active': true,
            'sort': 1,
          },
        ],
        'stats': {'paid': 12, 'review': 1, 'subscriptions': 4, 'problems': 0},
      };

  static final Map<String, dynamic> _routes = {
    '/admin/learners': {
      'rows': [
        {
          'id': 11,
          'first_name': 'Olivera',
          'last_name': 'Diallo',
          'email': 'olivera@example.com',
          'role': 'learner',
          'is_active': true,
          'created_at': '2026-11-23T10:00:00Z',
          'signup_source': 'email',
          'email_verified': true,
          'learn_access': 'free',
          'country': 'Canada',
          'whatsapp': '+15145550199',
          'french_level': 'A2',
          'google_linked': false,
          'organization_id': null,
          'organization': null,
          'organization_access': null,
          'premium': false,
          'premium_tier': null,
          'premium_until': null,
          'premium_via_company': false,
          'request_id': 77,
          'requested_at': '2026-11-23T12:00:00Z',
          'request_message': 'Ready for TEF prep!',
          'last_seen_at': '2026-11-24T10:00:00Z',
        },
        {
          'id': 12,
          'first_name': 'Tahera',
          'last_name': 'Bashar',
          'email': 'tahera@example.com',
          'role': 'student',
          'is_active': true,
          'created_at': '2026-11-16T10:00:00Z',
          'signup_source': 'portal',
          'email_verified': true,
          'learn_access': 'free',
          'country': 'France',
          'whatsapp': null,
          'french_level': 'B2',
          'google_linked': false,
          'organization_id': null,
          'organization': null,
          'organization_access': null,
          'premium': true,
          'premium_tier': 'standard',
          'premium_until': '2027-02-16T23:59:59Z',
          'premium_via_company': false,
          'request_id': null,
          'last_seen_at': null,
        },
      ],
      'total': 2,
      'page': 1,
      'limit': 25,
      'stats': {
        'learners': 6,
        'total_people': 9,
        'portal_people': 3,
        'new_week': 6,
        'premium_people': 4,
        'standard_people': 1,
        'premium_tier_people': 3,
        'active_7d': 5,
        'open_requests': 1,
      },
    },
    '/admin/learners/11': {
      'user': {
        'id': 11,
        'first_name': 'Olivera',
        'last_name': 'Diallo',
        'email': 'olivera@example.com',
        'role': 'learner',
        'is_active': true,
        'created_at': '2026-11-23T10:00:00Z',
        'signup_source': 'email',
        'email_verified': true,
        'google_linked': false,
        'country': 'Canada',
        'whatsapp': '+15145550199',
        'french_level': 'A2',
        'lang': 'en',
        'marketing_opt_in': true,
        'learn_access': 'free',
        'organization': null,
      },
      'access': {'level': 'free', 'plan': 'free', 'website': true, 'premium': null},
      'licenses': [
        {
          'id': 90,
          'tier': 'premium',
          'source': 'manual',
          'starts_at': '2026-11-24T00:00:00Z',
          'ends_at': null,
          'reason': 'Gift week',
          'created_at': '2026-11-24T00:00:00Z',
          'via_company': false,
          'active': true,
          'created_by_name': 'Yao Maxime',
        },
      ],
      'history': [
        {
          'action': 'premium_requested',
          'detail': {'message': 'Ready for TEF prep!'},
          'created_at': '2026-11-23T12:00:00Z',
          'actor_name': 'Olivera Diallo',
        },
      ],
      'requests': [
        {'id': 77, 'message': 'Ready for TEF prep!', 'status': 'open', 'created_at': '2026-11-23T12:00:00Z'},
      ],
      'devices': 1,
      'lessons_opened_30d': 14,
    },
    '/admin/learners/organizations': {
      'rows': [
        {
          'id': 4,
          'name': 'SGTL Formation',
          'status': 'active',
          'learn_access': 'free',
          'accounts': 5,
          'premium': true,
          'premium_tier': 'premium',
          'premium_until': '2027-06-30T23:59:59Z',
        },
      ],
    },
    '/admin/learners/billing/payments': {
      'rows': [
        {
          'id': 301,
          'reference': 'pay_ref_review_001',
          'amount': 900000,
          'currency': 'XOF',
          'display_amount': 1499,
          'display_currency': 'USD',
          'invoice_number': 'INV-2026-0042',
          'days': 30,
          'status': 'review',
          'status_detail': 'Waiting confirmation',
          'created_at': '2026-11-24T09:00:00Z',
          'paid_at': null,
          'renewal': false,
          'first_name': 'Olivera',
          'last_name': 'Diallo',
          'email': 'olivera@example.com',
          'offer': 'Premium — Monthly',
          'premium_until': null,
        },
      ],
      'total': 1,
      'page': 1,
      'limit': 25,
      'summary': {
        'all': 1,
        'success': 0,
        'review': 1,
        'failed': 0,
        'refunded': 0,
        'initialized': 0,
        'revenue': [
          {'currency': 'USD', 'amount': 14990},
        ],
      },
    },
  };

  Response<T> _ok<T>(String path, dynamic data) => Response<T>(requestOptions: RequestOptions(path: path), statusCode: 200, data: data as T);

  @override
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters, Options? options}) async {
    final bare = path.split('?').first;
    queries[bare] = queryParameters;
    if (bare == '/admin/learners/mode') {
      return _ok<T>(path, {'mode': _mode, 'updated_at': '2026-11-24T12:00:00Z', 'updated_by': 'Yao Maxime'});
    }
    if (bare == '/admin/learners/billing') {
      return _ok<T>(path, _billing());
    }
    return _ok<T>(path, _routes[bare] ?? <String, dynamic>{});
  }

  @override
  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options, ProgressCallback? onSendProgress}) async {
    sent[path] = data;
    if (path.endsWith('/recheck')) return _ok<T>(path, {'ok': true, 'outcome': 'success'});
    return _ok<T>(path, {'ok': true});
  }

  @override
  Future<Response<T>> put<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    sent[path] = data;
    if (path == '/admin/learners/mode' && data is Map) {
      _mode = '${data['mode']}';
      return _ok<T>(path, {'mode': _mode, 'updated_at': '2026-11-24T12:30:00Z', 'updated_by': 'Yao Maxime'});
    }
    if (path == '/admin/learners/billing/plans') {
      return _ok<T>(path, {'ok': true, 'catalog': _catalog, 'offers': _billing()['offers']});
    }
    return _ok<T>(path, {'ok': true});
  }
}

Future<_FakeOnlineApi> _show(WidgetTester tester, Widget screen, {Size size = const Size(360, 780), String lang = 'en'}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final api = _FakeOnlineApi();
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        apiClientProvider.overrideWithValue(api),
        tokenStorageProvider.overrideWithValue(_NoSession()),
      ],
      child: MaterialApp(
        locale: Locale(lang),
        supportedLocales: const [Locale('en'), Locale('fr')],
        localizationsDelegates: const [
          GlobalMaterialLocalizations.delegate,
          GlobalWidgetsLocalizations.delegate,
          GlobalCupertinoLocalizations.delegate,
        ],
        home: Scaffold(body: screen),
      ),
    ),
  );
  await tester.pumpAndSettle();
  return api;
}

void main() {
  setUpAll(() async {
    await initializeDateFormatting('en');
    await initializeDateFormatting('fr');
  });

  testWidgets('Online courses fits 360px phone and 1200px tablet in EN & FR without overflow', (tester) async {
    for (final lang in ['en', 'fr']) {
      for (final size in [const Size(360, 780), const Size(1200, 900)]) {
        await _show(tester, const OnlineCoursesScreen(), size: size, lang: lang);
        expect(find.text('Online courses'), lang == 'en' ? findsOneWidget : findsNothing);
        expect(find.text('Cours en ligne'), lang == 'fr' ? findsOneWidget : findsNothing);
        await tester.scrollUntilVisible(find.text('Olivera Diallo'), 250, scrollable: find.byType(Scrollable).first);
        expect(find.text('Olivera Diallo'), findsOneWidget);
        expect(find.text('+15145550199'), findsOneWidget);
        expect(tester.takeException(), isNull);
      }
    }
  });

  testWidgets('Website mode switcher asks for confirmation before PUT /admin/learners/mode', (tester) async {
    final api = await _show(tester, const OnlineCoursesScreen(), size: const Size(1200, 900));
    await tester.tap(find.text('Paid Plans'));
    await tester.pumpAndSettle();
    expect(find.text('Turn on Paid Plans (Free · Standard · Premium)?'), findsOneWidget);
    await tester.tap(find.text('Cancel'));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/learners/mode'], isNull);

    await tester.tap(find.text('Paid Plans'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Enable Paid Plans'));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/learners/mode'], {'mode': 'premium'});
    expect(find.text('Free · Standard · Premium'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Learner detail panel opens, activates Standard plan, dismisses request, and revokes license', (tester) async {
    final api = await _show(tester, const OnlineCoursesScreen(), size: const Size(1200, 1200));
    await tester.tap(find.text('Olivera Diallo'));
    await tester.pumpAndSettle();

    await tester.scrollUntilVisible(find.textContaining('Ready for TEF prep!').last, 250, scrollable: find.byType(Scrollable).last);
    expect(find.textContaining('Ready for TEF prep!'), findsWidgets);
    await tester.tap(find.text('Dismiss request'));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/learners/requests/77/dismiss'], isNotNull);

    await tester.scrollUntilVisible(find.text('Standard (Courses)'), 250, scrollable: find.byType(Scrollable).last);
    await tester.tap(find.text('Standard (Courses)'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Activate Standard'));
    await tester.pumpAndSettle();
    final granted = api.sent['/admin/learners/11/premium'] as Map;
    expect(granted['tier'], 'standard');

    await tester.scrollUntilVisible(find.text('End active plan now'), 250, scrollable: find.byType(Scrollable).last);
    await tester.tap(find.text('End active plan now'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('End Plan'));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/learners/11/premium/revoke'], isNotNull);
    expect(tester.takeException(), isNull);
  });

  testWidgets('Companies tab manages website access and company plans', (tester) async {
    final api = await _show(tester, const OnlineCoursesScreen(), size: const Size(1200, 900));
    await tester.tap(find.text('Companies'));
    await tester.pumpAndSettle();
    expect(find.text('SGTL Formation'), findsOneWidget);

    await tester.tap(find.text('Change plan'));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Activate Company Plan'));
    await tester.pumpAndSettle();
    final compGrant = api.sent['/admin/learners/organizations/4/premium'] as Map;
    expect(compGrant['tier'], 'premium');
    expect(tester.takeException(), isNull);
  });

  testWidgets('Plans & payments studio recalculates discounts, saves plans, and rechecks review payment', (tester) async {
    final api = await _show(tester, const OnlineCoursesScreen(), size: const Size(1200, 1200));
    await tester.tap(find.text('Plans & payments'));
    await tester.pumpAndSettle();

    expect(find.text('Paystack Checkout Gateway'), findsOneWidget);
    expect(find.text('INV-2026-0042 · Waiting confirmation'), findsOneWidget);

    // Changing quarterly discount from 10% to 20% updates quarterly prices live:
    // Standard 9.99 * 3 * 0.8 = 23.98; Premium 14.99 * 3 * 0.8 = 35.98
    await tester.scrollUntilVisible(find.byKey(const Key('billing-q-disc')), 200, scrollable: find.byType(Scrollable).first);
    await tester.enterText(find.byKey(const Key('billing-q-disc')), '20');
    await tester.pumpAndSettle();

    final stdQField = tester.widget<TextFormField>(find.byKey(const Key('price-standard-quarterly')));
    expect(stdQField.controller?.text, '23.98');

    await tester.scrollUntilVisible(find.byKey(const Key('billing-save-plans')), 200, scrollable: find.byType(Scrollable).first);
    await tester.tap(find.byKey(const Key('billing-save-plans')));
    await tester.pumpAndSettle();
    final savedPlans = api.sent['/admin/learners/billing/plans'] as Map;
    expect((savedPlans['discounts'] as Map)['quarterly'], 20);

    // Dismiss floating save SnackBar before scrolling/tapping bottom ledger button.
    await tester.pump(const Duration(seconds: 5));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(find.text('Ask Paystack'), 250, scrollable: find.byType(Scrollable).first);
    await tester.drag(find.byType(Scrollable).first, const Offset(0, -120));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Ask Paystack'));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/learners/billing/payments/301/recheck'], isNotNull);
    expect(tester.takeException(), isNull);
  });

  testWidgets('DemoDetailPanel renders WhatsApp quick action cleanly at 360px', (tester) async {
    await _show(
      tester,
      DemoDetailPanel(
        request: {
          'id': 5,
          'full_name': 'Amira Benali',
          'email': 'amira@example.com',
          'phone': '+33 6 38 42 19 75',
          'country': 'France',
          'timezone': 'Europe/Paris',
          'status': 'new',
          'interest': 'exam',
          'created_at': '2026-11-24T09:00:00Z',
        },
        onChanged: () async {},
      ),
      size: const Size(360, 780),
    );
    expect(find.text('WhatsApp'), findsNWidgets(2), reason: 'quick action button + contact info row');
    expect(tester.takeException(), isNull);
  });

  testWidgets('DemoDetailPanel handles long text fields gracefully at 360px', (tester) async {
    await _show(
      tester,
      DemoDetailPanel(
        request: {
          'id': 6,
          'full_name': 'Jean-Baptiste Emmanuel de la Fontaine-Montmorency',
          'email': 'jean.baptiste.very.long.email.address@international-french-organization.example.com',
          'phone': '+212 6 36 80 06 82',
          'country': 'Morocco',
          'timezone': 'Africa/Casablanca',
          'status': 'new',
          'interest': 'classes',
          'current_level': 'A1',
          'interested_level': 'C1',
          'has_previous_experience': true,
          'previous_study_method': 'University evening courses combined with Alliance Francaise workshops and conversation clubs over two years.',
          'expected_start_time': 'Immediately after completing my relocation paperwork next month',
          'preferred_schedule': 'Weekday evenings after 7 PM local time or Saturday mornings before noon.',
          'learning_goals': 'Reach C1 level for TEF Canada immigration and lead client meetings fluently in French without hesitation.',
          'expectations': 'Structured speaking practice, written feedback after every session, and realistic mock interviews.',
          'created_at': '2026-11-24T09:00:00Z',
        },
        onChanged: () async {},
      ),
      size: const Size(360, 780),
    );
    expect(find.text('Contact'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Learning Profile'), 250, scrollable: find.byType(Scrollable).first);
    expect(find.text('Learning Profile'), findsOneWidget);
    await tester.scrollUntilVisible(find.text('Goals & Expectations'), 250, scrollable: find.byType(Scrollable).first);
    expect(find.text('Goals & Expectations'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  test('OnlineFmt helpers calculate rounded prices and discounts accurately', () {
    expect(OnlineFmt.discountedPrice(9.99, 3, 10, 'USD'), 26.97);
    expect(OnlineFmt.discountedPrice(14.99, 12, 20, 'USD'), 143.90);
    expect(OnlineFmt.discountedPrice(5000, 3, 10, 'XOF'), 13500);
    expect(OnlineFmt.whatsappDigits('+1 (514) 555-0199'), '15145550199');
  });
}
