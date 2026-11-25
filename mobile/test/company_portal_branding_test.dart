import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/auth/token_storage.dart';
import 'package:mobile/features/admin/companies/company_detail_panel.dart';
import 'package:mobile/features/admin/companies/company_editor_panel.dart';
import 'package:mobile/features/admin/companies/company_model.dart';
import 'package:mobile/features/admin/companies/portal_branding_panel.dart';

class _NoSession extends TokenStorage {
  @override
  Future<String?> getToken() async => null;
}

class _FakePortalApi extends ApiClient {
  _FakePortalApi() : super(customBaseUrl: 'http://test.invalid/api');

  final sent = <String, dynamic>{};

  static Map<String, dynamic> org() => {
        'id': 4,
        'name': 'Data Tech SAS',
        'display_name': 'Data Tech',
        'slug': 'data-tech',
        'default_language': 'en',
        'status': 'active',
        'state': 'active',
        'access_starts_at': '2026-01-01T00:00:00Z',
        'access_ends_at': '2028-01-01T00:00:00Z',
        'days_left': 700,
        'expiring_soon': false,
        'seat_limit': 10,
        'seats_used': 2,
        'seats_left': 8,
        'active_learners': 2,
        'learners': 2,
        'notes': null,
        'brand': {
          'name': 'Data Tech',
          'logo_url': null,
          'cover_url': null,
          'branding': const PortalBranding().toJson(),
        },
        'credits': {
          'ee': {'reserve': 10, 'with_learners': 0, 'used': 0, 'granted': 10},
          'eo': {'reserve': 10, 'with_learners': 0, 'used': 0, 'granted': 10},
        },
        'content': [
          {'content_type': 'category', 'content_id': 2, 'name': 'Compréhension Orale'},
        ],
        'managers': <dynamic>[],
      };

  static final _tree = [
    {'id': 2, 'content_id': 2, 'type': 'category', 'name': 'Compréhension Orale', 'children': <dynamic>[]},
  ];

  Response<T> _ok<T>(String path, dynamic data) => Response<T>(
        requestOptions: RequestOptions(path: path),
        statusCode: 200,
        data: data as T,
      );

  @override
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters, Options? options}) async {
    if (path == '/admin/organizations/4') return _ok<T>(path, org());
    if (path == '/admin/organizations/4/learners') return _ok<T>(path, <dynamic>[]);
    if (path == '/admin/organizations/4/credits') return _ok<T>(path, {'items': <dynamic>[]});
    if (path == '/admin/organizations/4/history') {
      return _ok<T>(path, {
        'summary': {
          'access': {'original_end': '2028-01-01T00:00:00Z', 'current_end': '2028-01-01T00:00:00Z', 'extensions': 0, 'days_added': 0},
          'credits': {'granted': {'ee': 10, 'eo': 10}, 'revoked': {'ee': 0, 'eo': 0}},
          'package': {'original': 10, 'current': 10, 'changes': 0},
          'status': {'current': 'active', 'suspensions': 0},
        },
        'items': <dynamic>[],
        'next_before': null,
      });
    }
    if (path == '/tcf/exam-assignments/content-tree') return _ok<T>(path, _tree);
    return _ok<T>(path, <String, dynamic>{});
  }

  @override
  Future<Response<T>> put<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    sent[path] = data;
    return _ok<T>(path, org());
  }

  @override
  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options, ProgressCallback? onSendProgress}) async {
    sent[path] = data;
    return _ok<T>(path, {'organization': org(), 'manager': {'invitation_sent': true}});
  }
}

Future<_FakePortalApi> _mount(WidgetTester tester, Widget child, {Size size = const Size(390, 844)}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final api = _FakePortalApi();
  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        apiClientProvider.overrideWithValue(api),
        tokenStorageProvider.overrideWithValue(_NoSession()),
      ],
      child: MaterialApp(
        locale: const Locale('en'),
        supportedLocales: const [Locale('en'), Locale('fr')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(body: child),
      ),
    ),
  );
  await tester.pumpAndSettle();
  return api;
}

void main() {
  test('PortalBranding validation blocks unsafe URLs, bad hex colors, and reserved slugs', () {
    expect(isValidHexColor('#16325C'), isTrue);
    expect(isValidHexColor('red'), isFalse);

    for (final badUrl in [
      'javascript:alert(1)',
      'http://acme.com',
      'https://localhost/app',
      'https://127.0.0.1/test',
      'https://user:pass@acme.com',
    ]) {
      expect(isValidHttpsPortalUrl(badUrl), isFalse, reason: badUrl);
    }
    expect(isValidHttpsPortalUrl('https://acme.com/french'), isTrue);
    expect(isValidHttpsPortalUrl(''), isTrue);

    expect(isValidPortalSlug('data-tech'), isTrue);
    expect(isValidPortalSlug('admin'), isFalse);
    expect(isValidPortalSlug('o'), isFalse);
    expect(isValidPortalSlug('BAD SLUG'), isFalse);

    final parsed = PortalBranding.fromJson({'primary_color': '#065f46', 'login_layout': 'centered', 'hide_powered_by': false});
    expect(parsed.primaryColor, '#065F46');
    expect(parsed.loginLayout, 'centered');
    expect(parsed.hidePoweredBy, isFalse);
  });

  testWidgets('PortalBrandingPanel renders live preview across viewports and saves updates', (tester) async {
    final company = Company.fromJson(_FakePortalApi.org());
    final api = await _mount(tester, PortalBrandingPanel(company: company), size: const Size(390, 900));

    expect(find.text('Live sign-in preview'), findsOneWidget);
    expect(tester.takeException(), isNull);

    final listScroll = find.byWidgetPredicate((w) => w is Scrollable && w.axisDirection == AxisDirection.down).first;
    final emerald = find.widgetWithText(ChoiceChip, 'Forest Emerald');
    await tester.scrollUntilVisible(emerald, 240, scrollable: listScroll);
    await tester.pumpAndSettle();
    await tester.tap(emerald);
    await tester.pumpAndSettle();

    final centered = find.text('Centered');
    await tester.scrollUntilVisible(centered, 240, scrollable: listScroll);
    await tester.pumpAndSettle();
    await tester.tap(centered);
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);

    await tester.scrollUntilVisible(find.byIcon(Icons.smartphone), -240, scrollable: listScroll);
    await tester.pumpAndSettle();
    await tester.tap(find.byIcon(Icons.smartphone));
    await tester.pumpAndSettle();
    await tester.tap(find.text('2. Pass'));
    await tester.pumpAndSettle();
    expect(tester.takeException(), isNull);

    await tester.tap(find.byKey(const Key('portal-branding-save')));
    await tester.pumpAndSettle();

    final sent = api.sent['/admin/organizations/4'] as Map<String, dynamic>;
    final branding = sent['portal_branding'] as Map<String, dynamic>;
    expect(branding['primary_color'], '#065F46');
    expect(branding['login_layout'], 'centered');
  });

  testWidgets('CompanyDetailPanel exposes Portal & Branding action', (tester) async {
    await _mount(tester, const CompanyDetailPanel(companyId: 4), size: const Size(1024, 1600));
    expect(find.byKey(const Key('company-branding')), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('CompanyEditorPanel opens preview dialog and includes portal_branding on create', (tester) async {
    final api = await _mount(tester, const CompanyEditorPanel(), size: const Size(1024, 2200));
    await tester.enterText(find.widgetWithText(TextFormField, 'Company name'), 'Acme Academy');

    final toggle = find.byKey(const Key('company-portal-toggle'));
    await tester.ensureVisible(toggle);
    await tester.pumpAndSettle();
    await tester.tap(toggle);
    await tester.pumpAndSettle();
    final indigo = find.widgetWithText(ChoiceChip, 'Royal Indigo');
    await tester.ensureVisible(indigo);
    await tester.pumpAndSettle();
    await tester.tap(indigo);
    await tester.pumpAndSettle();
    final minimal = find.text('Minimal');
    await tester.ensureVisible(minimal);
    await tester.pumpAndSettle();
    await tester.tap(minimal);
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('company-preview-portal')));
    await tester.pumpAndSettle();
    expect(find.text('Aperçu du portail de connexion'), findsOneWidget);
    expect(tester.takeException(), isNull);
    await tester.tap(find.byIcon(Icons.close).last);
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('company-pick-content')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('company-content-all')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Done'));
    await tester.pumpAndSettle();

    await tester.enterText(find.widgetWithText(TextFormField, 'First name'), 'Claire');
    await tester.enterText(find.widgetWithText(TextFormField, 'Last name'), 'Dupont');
    await tester.enterText(find.widgetWithText(TextFormField, 'Email address'), 'claire@acme.example');
    await tester.tap(find.byKey(const Key('company-save')));
    await tester.pumpAndSettle();

    final body = api.sent['/admin/organizations'] as Map<String, dynamic>;
    final pb = body['portal_branding'] as Map<String, dynamic>;
    expect(pb['primary_color'], '#312E81');
    expect(pb['login_layout'], 'minimal');
  });

  testWidgets('CompanyEditorPanel pre-fills all company and branding fields when editing', (tester) async {
    final existing = Company.fromJson({
      ..._FakePortalApi.org(),
      'notes': 'Priority enterprise client',
      'brand': {
        'name': 'Data Tech',
        'logo_url': null,
        'cover_url': null,
        'branding': const PortalBranding(
          primaryColor: '#065F46',
          secondaryColor: '#0EA5E9',
          loginLayout: 'centered',
          tagline: 'Executive French',
        ).toJson(),
      },
    });
    final api = await _mount(tester, CompanyEditorPanel(company: existing), size: const Size(1024, 2400));

    expect(find.widgetWithText(TextFormField, 'Data Tech SAS'), findsOneWidget);
    expect(find.widgetWithText(TextFormField, 'Data Tech'), findsOneWidget);
    expect(find.widgetWithText(TextField, 'data-tech'), findsOneWidget);
    expect(find.widgetWithText(TextField, 'Executive French'), findsOneWidget);
    expect(find.text('Compréhension Orale'), findsOneWidget);
    expect(tester.takeException(), isNull);

    await tester.enterText(find.widgetWithText(TextFormField, 'Company name'), 'Data Tech Global');
    await tester.enterText(find.widgetWithText(TextField, 'data-tech'), 'data-tech-global');
    final bordeaux = find.widgetWithText(ChoiceChip, 'Bordeaux Editorial');
    await tester.ensureVisible(bordeaux);
    await tester.pumpAndSettle();
    await tester.tap(bordeaux);
    await tester.pumpAndSettle();

    await tester.tap(find.byKey(const Key('company-save')));
    await tester.pumpAndSettle();

    final sent = api.sent['/admin/organizations/4'] as Map<String, dynamic>;
    expect(sent['name'], 'Data Tech Global');
    expect(sent['slug'], 'data-tech-global');
    final pb = sent['portal_branding'] as Map<String, dynamic>;
    expect(pb['primary_color'], '#7F1D1D');
    expect(pb['tagline'], 'Executive French');
  });
}
