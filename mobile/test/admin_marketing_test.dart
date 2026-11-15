import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/auth/token_storage.dart';
import 'package:mobile/features/admin/common/admin_kit.dart';
import 'package:mobile/features/admin/common/admin_state.dart';
import 'package:mobile/features/admin/marketing/campaign_detail_panel.dart';
import 'package:mobile/features/admin/marketing/campaign_editor_panel.dart';
import 'package:mobile/features/admin/marketing/campaign_flyer.dart';
import 'package:mobile/features/admin/marketing/campaign_share_panel.dart';
import 'package:mobile/features/admin/marketing/marketing_model.dart';
import 'package:mobile/features/admin/marketing/marketing_screen.dart';
import 'package:mobile/features/admin/marketing/marketing_widgets.dart';
import 'package:mobile/features/admin/marketing/registration_panel.dart';
import 'package:qr_flutter/qr_flutter.dart';

Map<String, dynamic> _campaign({int id = 7, String status = 'published', String state = 'live', int seats = 8, int taken = 8, int fresh = 2, String? image}) =>
    {
      'id': id,
      'slug': 'groupe-tcf-janvier',
      'kind': 'group_class',
      'status': status,
      'state': state,
      'title_en': 'TCF Canada group – January evenings',
      'title_fr': 'Groupe TCF Canada – janvier, cours intensifs du soir',
      'tagline_en': 'Eight weeks to reach NCLC 7 with a native teacher',
      'tagline_fr': 'Huit semaines pour atteindre le NCLC 7 avec un professeur natif',
      'description_en': null,
      'description_fr': null,
      'highlights_en': ['8 people at most', 'Native teacher'],
      'highlights_fr': ['8 personnes au plus', 'Professeur natif', 'Replay de chaque cours'],
      'cta_en': null,
      'cta_fr': null,
      'badge_en': '-20%',
      'badge_fr': '-20 %',
      'audience': 'tcf',
      'level': 'B1',
      'class_starts_on': '2027-01-12',
      'class_ends_on': '2027-03-04',
      'schedule_en': 'Tuesday and Thursday, 6–7:30 pm (Montreal time)',
      'schedule_fr': 'Mardi et jeudi, 18 h – 19 h 30 (heure de Montréal)',
      'teacher_name': 'Maxime Tremblay-Lefebvre',
      'seat_limit': seats,
      'show_seats': true,
      'price_regular': 499,
      'price_promo': 399,
      'currency': 'CAD',
      'price_note_en': 'for 8 weeks',
      'price_note_fr': 'pour 8 semaines',
      'starts_at': '2026-11-01T12:00:00Z',
      'ends_at': '2030-01-10T23:59:00Z',
      'show_countdown': true,
      'place_bar': true,
      'place_home': true,
      'place_flash': false,
      'place_learn': true,
      'priority': 10,
      'theme': 'navy',
      'image_key': image,
      'registration_mode': 'form',
      'cta_url': null,
      'created_at': '2026-11-01T12:00:00Z',
      'updated_at': '2026-11-02T12:00:00Z',
      'registrations': 10,
      'new_registrations': fresh,
      'seats_taken': taken,
      'seats_left': seats - taken < 0 ? 0 : seats - taken,
      'waitlist': 2,
      'last_registration_at': '2026-11-13T15:00:00Z',
      'views': 1240,
      'clicks': 96,
    };

final _registrations = [
  {
    'id': 31,
    'full_name': 'Aminata Koné-Ouattara',
    'email': 'aminata.kone@example.com',
    'phone': '+1 514 555 0199',
    'country': 'Côte d’Ivoire',
    'level': 'B1',
    'message': 'Je prépare le TCF pour mars, le soir me convient très bien.',
    'language': 'fr',
    'timezone': 'America/Toronto',
    'placement': 'learn',
    'source_path': '/fr/apprendre/tcf-canada/',
    'status': 'new',
    'notes': null,
    'created_at': '2026-11-13T15:00:00Z',
    'updated_at': '2026-11-13T15:00:00Z',
  },
  {
    'id': 32,
    'full_name': 'John Smith',
    'email': 'john@example.com',
    'phone': null,
    'country': 'Canada',
    'level': null,
    'message': null,
    'language': 'en',
    'timezone': null,
    'placement': 'bar',
    'source_path': '/',
    'status': 'confirmed',
    'notes': 'Paid on 3 Nov',
    'created_at': '2026-11-03T15:00:00Z',
    'updated_at': '2026-11-03T15:00:00Z',
  },
  {
    'id': 33,
    'full_name': 'Lina Haddad',
    'email': 'lina@example.com',
    'phone': '06 12 34 56 78',
    'country': 'Maroc',
    'level': 'A2',
    'message': null,
    'language': 'fr',
    'timezone': null,
    'placement': 'link',
    'source_path': null,
    'status': 'waitlist',
    'notes': null,
    'created_at': '2026-11-12T15:00:00Z',
    'updated_at': '2026-11-12T15:00:00Z',
  },
];

/// Answers like /admin/promotions, from canned data, and records what is sent.
class _FakeMarketingApi extends ApiClient {
  final bool installed;
  _FakeMarketingApi({this.installed = true}) : super(customBaseUrl: 'http://test.invalid/api');

  final sent = <String, dynamic>{};

  Map<String, dynamic>? _route(String path) => switch (path) {
    '/admin/promotions' => {
      'promotions': [
        _campaign(image: 'cat-tcf'),
        {
          ..._campaign(id: 8, status: 'draft', state: 'draft', seats: 12, taken: 0, fresh: 0),
          'title_en': 'Free conversation workshop',
          'kind': 'event',
          'theme': 'forest',
        },
        {..._campaign(id: 9, state: 'scheduled', seats: 10, taken: 3, fresh: 0), 'title_en': 'Business French – spring', 'theme': 'plum'},
      ],
      'summary': {'live': 1, 'scheduled': 1, 'registrations': 13, 'registrations_week': 4, 'new_registrations': 2, 'views': 1900, 'conversion': 0.7},
    },
    '/admin/promotions/alerts' => {'waiting': 2},
    '/admin/promotions/ai' => {'available': true, 'engine': 'vertex', 'writing_model': 'gemini-3.1-pro-preview', 'image_model': 'gemini-3.1-flash-image'},
    '/admin/promotions/7' => {
      'promotion': _campaign(),
      'stats': {
        'places': [
          {'placement': 'learn', 'views': 800, 'clicks': 60, 'registrations': 6},
          {'placement': 'bar', 'views': 440, 'clicks': 36, 'registrations': 3},
        ],
        'days': [
          {'day': _today(-1), 'views': 120, 'clicks': 9},
          {'day': _today(0), 'views': 60, 'clicks': 4},
        ],
        'registration_days': [
          {'day': _today(-1), 'registrations': 2},
        ],
      },
    },
    '/admin/promotions/7/registrations' => {'registrations': _registrations},
    _ => null,
  };

  static String _today(int offset) {
    final d = DateTime.now().add(Duration(days: offset));
    return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
  }

  Response<T> _ok<T>(String path, dynamic data) => Response<T>(
    requestOptions: RequestOptions(path: path),
    statusCode: 200,
    data: data as T,
  );

  void _check() {
    if (!installed) {
      throw ApiException(
        message: 'Run backend/database/run-promotions-migration.js on the server',
        statusCode: 503,
        details: {'code': 'PROMOTIONS_NOT_MIGRATED'},
      );
    }
  }

  @override
  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters, Options? options}) async {
    _check();
    return _ok<T>(path, _route(path) ?? <String, dynamic>{});
  }

  @override
  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options, ProgressCallback? onSendProgress}) async {
    _check();
    sent[path] = data;
    // The AI writer and painter answer like the server does.
    if (path == '/admin/promotions/ai/draft') {
      return _ok<T>(path, {
        'fields': {
          ..._campaign(),
          'title_fr': 'Groupe TCF Canada du soir : objectif NCLC 7',
          'title_en': 'Evening TCF Canada group: NCLC 7 target',
          'highlights_en': ['8 people at most', 'Weekly mock exams'],
          'seat_limit': 8,
          'price_regular': 600,
          'price_promo': 480,
          'image_key': 'cat-tcf',
        },
        'notes': ['The 8 weeks were worked out from the dates.'],
        'image_prompt': 'An adult learner at a desk in the evening, laptop seen from behind.',
        'model': 'gemini-3.1-pro-preview',
        'engine': 'vertex',
      });
    }
    if (path == '/admin/promotions/ai/image') {
      return _ok<T>(path, {'image_key': 'ai-0123456789ab', 'model': 'gemini-3.1-flash-image', 'engine': 'vertex', 'warning': null});
    }
    final created = path == '/admin/promotions' ? 41 : (path.endsWith('/duplicate') ? 42 : null);
    final body = created != null ? {'id': created} : _campaign(status: J.s(J.map(data)['status']));
    return _ok<T>(path, {'promotion': body});
  }

  @override
  Future<Response<T>> put<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    _check();
    sent[path] = data;
    return _ok<T>(path, {'promotion': _campaign()});
  }

  @override
  Future<Response<T>> patch<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    _check();
    sent[path] = data;
    return _ok<T>(path, {
      'registration': {..._registrations.first, ...J.map(data)},
    });
  }

  @override
  Future<Response<T>> delete<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    _check();
    sent['DELETE $path'] = true;
    return _ok<T>(path, {'success': true});
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

const _phone = Size(360, 740);
const _tablet = Size(1024, 768);

Future<(_FakeMarketingApi, ProviderContainer)> _show(
  WidgetTester tester,
  Widget screen, {
  Size size = _phone,
  String lang = 'en',
  bool installed = true,
}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final api = _FakeMarketingApi(installed: installed);
  final container = ProviderContainer(overrides: [apiClientProvider.overrideWithValue(api), tokenStorageProvider.overrideWithValue(_NoSession())]);
  addTearDown(container.dispose);
  await tester.pumpWidget(
    UncontrolledProviderScope(
      container: container,
      child: MaterialApp(
        locale: Locale(lang),
        supportedLocales: const [Locale('en'), Locale('fr')],
        localizationsDelegates: GlobalMaterialLocalizations.delegates,
        home: Scaffold(body: screen),
      ),
    ),
  );
  await tester.pumpAndSettle();
  return (api, container);
}

/// The scrolling list of the panel on top.
Finder _panelScroll() => find.descendant(of: find.byType(AdminPanel).last, matching: find.byType(Scrollable)).first;

/// A button that opens [panel] the way the app does, so it can pop.
class _Opener extends StatelessWidget {
  final Widget panel;
  const _Opener(this.panel);

  @override
  Widget build(BuildContext context) => Center(
    child: TextButton(
      onPressed: () => showAdminPanel(context, builder: (_) => panel),
      child: const Text('open'),
    ),
  );
}

void main() {
  setUpAll(() async {
    await initializeDateFormatting('fr_FR');
    await initializeDateFormatting('en_US');
  });

  final screens = <String, Widget Function()>{
    'marketing': () => const MarketingScreen(),
    'campaign detail': () => const CampaignDetailPanel(campaignId: 7),
    'new campaign': () => const CampaignEditorPanel(),
    'edit campaign': () => CampaignEditorPanel(campaign: Campaign(_campaign())),
    'registration': () => RegistrationPanel(campaign: Campaign(_campaign()), registration: _registrations.first),
    'share': () => CampaignSharePanel(campaign: Campaign(_campaign())),
    'flyer': () => CampaignFlyerPanel(campaign: Campaign(_campaign()), fr: true),
  };

  for (final (size, lang) in [(_phone, 'en'), (_phone, 'fr'), (_tablet, 'fr'), (const Size(320, 640), 'fr')]) {
    for (final entry in screens.entries) {
      testWidgets('${entry.key} fits a ${size.width.round()} px screen ($lang)', (tester) async {
        await _show(tester, entry.value(), size: size, lang: lang);
        expect(tester.takeException(), isNull, reason: 'nothing overflows or throws');
      });
    }
  }

  for (final format in FlyerFormat.values) {
    for (final (fr, qr) in [(true, true), (false, true), (true, false)]) {
      testWidgets('the ${format.name} picture draws without overflowing (${fr ? 'fr' : 'en'}${qr ? ', QR code' : ''})', (tester) async {
        await _show(
          tester,
          Center(
            child: CampaignFlyer(
              campaign: Campaign({..._campaign(), 'title_fr': 'Groupe TCF Canada – janvier : cours intensifs du soir avec replay'}),
              fr: fr,
              format: format,
              showQr: qr,
            ),
          ),
          size: const Size(800, 900),
        );
        expect(tester.takeException(), isNull);
        expect(find.byType(CampaignQr), qr ? findsOneWidget : findsNothing);
        if (qr) {
          expect(
            tester.widget<CampaignQr>(find.byType(CampaignQr)).url,
            campaignUrl('groupe-tcf-janvier', fr: fr),
            reason: 'the code opens the campaign in the picture’s language',
          );
          expect(find.text(fr ? 'Scannez pour\nvous inscrire' : 'Scan to\nregister'), findsOneWidget);
        }
      });
    }
  }

  testWidgets('the list shows each campaign, its seats and who waits for an answer', (tester) async {
    final (_, container) = await _show(tester, const MarketingScreen(), size: _tablet);
    expect(find.text('TCF Canada group – January evenings'), findsOneWidget);
    expect(find.text('8 / 8'), findsOneWidget, reason: 'the full group');
    expect(find.text('2 to contact'), findsOneWidget);
    expect(find.text('Draft'), findsWidgets);
    expect(container.read(newPromoRegistrationsProvider), 2, reason: 'the menu badge follows the list');
    await tester.tap(find.widgetWithText(ChoiceChip, 'Drafts  1'));
    await tester.pumpAndSettle();
    expect(find.text('TCF Canada group – January evenings'), findsNothing);
    expect(find.text('Free conversation workshop'), findsOneWidget);
  });

  testWidgets('before the migration, marketing says how to install it', (tester) async {
    await _show(tester, const MarketingScreen(), installed: false);
    expect(find.text('Marketing is not installed yet'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('a campaign page shows the full group, the people and the results by place', (tester) async {
    await _show(tester, const CampaignDetailPanel(campaignId: 7), size: const Size(1024, 4000));
    expect(find.text('Group full'), findsOneWidget);
    expect(find.text('8 / 8'), findsOneWidget);
    expect(find.text('Aminata Koné-Ouattara'), findsOneWidget);
    expect(find.text('Waiting list'), findsWidgets);
    expect(find.text('Free courses'), findsWidgets);
    expect(find.text('Top bar'), findsWidgets);
    await tester.tap(find.widgetWithText(ChoiceChip, 'Confirmed  1'));
    await tester.pumpAndSettle();
    expect(find.text('Aminata Koné-Ouattara'), findsNothing);
    expect(find.text('John Smith'), findsOneWidget);
  });

  testWidgets('pausing a live campaign sends the new status', (tester) async {
    final (api, _) = await _show(tester, const CampaignDetailPanel(campaignId: 7), size: const Size(1024, 4000));
    await tester.tap(find.byKey(const Key('campaign-pause')));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/promotions/7/status'], {'status': 'paused'});
  });

  testWidgets('a campaign with registrations cannot be deleted, only archived', (tester) async {
    await _show(tester, const CampaignDetailPanel(campaignId: 7), size: const Size(1024, 4000));
    await tester.tap(find.byKey(const Key('campaign-more')));
    await tester.pumpAndSettle();
    expect(find.text('Delete (people registered: archive it)'), findsOneWidget);
    expect(find.text('Archive'), findsOneWidget);
  });

  testWidgets('a registration moves forward and keeps the team’s note', (tester) async {
    final (api, _) = await _show(
      tester,
      RegistrationPanel(campaign: Campaign(_campaign()), registration: _registrations.first),
      size: const Size(1024, 2000),
    );
    expect(find.text('WhatsApp'), findsOneWidget, reason: 'the phone number is long enough');
    await tester.tap(find.byKey(const Key('registration-status-contacted')));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/promotions/7/registrations/31'], {'status': 'contacted'});
    expect(find.text('Someone wrote or called; the seat is not confirmed yet.'), findsOneWidget);

    expect(find.byKey(const Key('registration-save-notes')), findsNothing);
    await tester.enterText(find.byKey(const Key('registration-notes')), 'Called on Friday, will pay Monday');
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('registration-save-notes')));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/promotions/7/registrations/31'], {'notes': 'Called on Friday, will pay Monday'});
  });

  testWidgets('a new campaign needs a title, then publishes with its seats and dates', (tester) async {
    final (api, _) = await _show(tester, const _Opener(CampaignEditorPanel()), size: const Size(1024, 1400));
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('campaign-save-publish')));
    await tester.pumpAndSettle();
    expect(find.text('Give the campaign a title, in French or in English.'), findsOneWidget);
    expect(api.sent['/admin/promotions'], isNull, reason: 'nothing is sent without a title');

    await tester.enterText(find.byKey(const Key('campaign-title-en')), 'DELF B2 group – February');
    await tester.scrollUntilVisible(find.byKey(const Key('campaign-seats')), 300, scrollable: _panelScroll());
    await tester.enterText(find.byKey(const Key('campaign-seats')), '12');
    await tester.scrollUntilVisible(find.byKey(const Key('campaign-theme-gold')), 300, scrollable: _panelScroll());
    await tester.tap(find.byKey(const Key('campaign-theme-gold')));
    await tester.pumpAndSettle();
    await tester.tap(find.byKey(const Key('campaign-save-publish')));
    await tester.pumpAndSettle();

    final body = api.sent['/admin/promotions'] as Map;
    expect(body['status'], 'published');
    expect(body['title_en'], 'DELF B2 group – February');
    expect(body['title_fr'], isNull);
    expect(body['seat_limit'], 12);
    expect(body['theme'], 'gold');
    expect(body['kind'], 'group_class');
    expect(body['registration_mode'], 'form');
    expect(body['place_home'], isTrue);
    expect(DateTime.parse(body['ends_at'] as String).isAfter(DateTime.parse(body['starts_at'] as String)), isTrue);
  });

  testWidgets('the AI writes the campaign in both languages, makes its picture, and can be undone', (tester) async {
    final (api, _) = await _show(tester, const _Opener(CampaignEditorPanel()), size: const Size(1024, 1400));
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    expect(find.text('gemini-3.1-pro-preview · Vertex AI'), findsOneWidget, reason: 'the engine and model in use');
    await tester.enterText(find.byKey(const Key('campaign-ai-brief')), 'New TCF Canada evening group in January, 8 seats, 480 \$ instead of 600 \$.');
    await tester.pump();
    await tester.tap(find.byKey(const Key('campaign-ai-go')));
    await tester.pumpAndSettle();

    final draft = api.sent['/admin/promotions/ai/draft'] as Map;
    expect(draft['brief'], startsWith('New TCF Canada evening group'));
    expect(draft['notes_lang'], 'en');
    expect(draft['timezone'], isNotEmpty);
    expect(draft.containsKey('current'), isFalse, reason: 'an empty new form is written, not changed');
    expect((api.sent['/admin/promotions/ai/image'] as Map)['prompt'], startsWith('An adult learner'), reason: 'the picture follows the AI art direction');

    expect(find.text('Written by gemini-3.1-pro-preview. The form and the preview are filled: read them, correct what is needed, then save.'), findsOneWidget);
    expect(find.text('The 8 weeks were worked out from the dates.'), findsOneWidget);
    final title = tester.widget<TextField>(find.descendant(of: find.byKey(const Key('campaign-title-en')), matching: find.byType(TextField)));
    expect(title.controller!.text, 'Evening TCF Canada group: NCLC 7 target');

    // Saved as written by the AI: both languages, the facts, the AI picture.
    await tester.tap(find.byKey(const Key('campaign-save-draft')));
    await tester.pumpAndSettle();
    final body = api.sent['/admin/promotions'] as Map;
    expect(body['title_fr'], 'Groupe TCF Canada du soir : objectif NCLC 7');
    expect(body['title_en'], 'Evening TCF Canada group: NCLC 7 target');
    expect(body['price_promo'], 480);
    expect(body['image_key'], 'ai-0123456789ab');
  });

  testWidgets('what the AI wrote can be undone', (tester) async {
    await _show(tester, const _Opener(CampaignEditorPanel()), size: const Size(1024, 1400));
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('campaign-ai-brief')), 'A free conversation workshop next Saturday.');
    await tester.pump();
    await tester.tap(find.byKey(const Key('campaign-ai-go')));
    await tester.pumpAndSettle();
    await tester.tap(find.text('Undo'));
    await tester.pumpAndSettle();
    final title = tester.widget<TextField>(find.descendant(of: find.byKey(const Key('campaign-title-en')), matching: find.byType(TextField)));
    expect(title.controller!.text, isEmpty, reason: 'the form is back as it was');
    expect(find.text('Undo'), findsNothing);
  });

  test('an AI picture is served by the API, a library photo by the site', () {
    expect(isAiImage('ai-0123456789ab'), isTrue);
    expect(isAiImage('cat-tcf'), isFalse);
    expect(campaignPictureUrl('ai-0123456789ab'), endsWith('/public/promotions/images/ai-0123456789ab-640.webp'));
    expect(campaignPictureUrl('ai-0123456789ab', large: true), endsWith('/public/promotions/images/ai-0123456789ab.webp'));
    expect(campaignPictureUrl('cat-tcf'), 'https://www.learnfrenchwithnatives.com/learn/img/cat-tcf-640.webp');
  });

  testWidgets('editing keeps both languages and sends the change', (tester) async {
    final (api, _) = await _show(tester, _Opener(CampaignEditorPanel(campaign: Campaign(_campaign()))), size: const Size(1024, 1400));
    await tester.tap(find.text('open'));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('campaign-title-en')), 'TCF Canada group – late January');
    await tester.tap(find.byKey(const Key('campaign-save')));
    await tester.pumpAndSettle();
    final body = api.sent['/admin/promotions/7'] as Map;
    expect(body['title_en'], 'TCF Canada group – late January');
    expect(body['title_fr'], 'Groupe TCF Canada – janvier, cours intensifs du soir');
    expect(body['highlights_fr'], ['8 personnes au plus', 'Professeur natif', 'Replay de chaque cours']);
    expect(body['class_starts_on'], '2027-01-12');
    expect(body['price_promo'], 399);
  });

  testWidgets('sharing shows a QR code of the link, in the chosen language', (tester) async {
    await _show(tester, CampaignSharePanel(campaign: Campaign(_campaign())), size: const Size(1024, 2000));
    CampaignQr qr() => tester.widget<CampaignQr>(find.descendant(of: find.byKey(const Key('share-qr')), matching: find.byType(CampaignQr)));
    expect(qr().url, campaignUrl('groupe-tcf-janvier', fr: false));
    await tester.tap(find.text('FR').first);
    await tester.pumpAndSettle();
    expect(qr().url, 'https://www.learnfrenchwithnatives.com/fr/offres/?p=groupe-tcf-janvier');
  });

  testWidgets('the QR code can be left out of the picture', (tester) async {
    await _show(tester, CampaignFlyerPanel(campaign: Campaign(_campaign()), fr: true), size: const Size(1024, 1400));
    expect(find.byType(CampaignQr), findsOneWidget);
    await tester.tap(find.byKey(const Key('flyer-qr')));
    await tester.pumpAndSettle();
    expect(find.byType(CampaignQr), findsNothing);
  });

  test('every campaign link fits in a QR code', () {
    for (final slug in ['groupe-tcf-janvier', 'a' * 60, 'groupe-tcf-janvier-12']) {
      for (final fr in [true, false]) {
        expect(
          QrValidator.validate(
            data: campaignUrl(slug, fr: fr),
            errorCorrectionLevel: QrErrorCorrectLevel.M,
          ).isValid,
          isTrue,
        );
      }
    }
  });

  test('the shared message names the campaign and ends with its link', () {
    final c = Campaign(_campaign());
    final fr = campaignMessage(c, fr: true);
    expect(fr.split('\n').first, '🎓 Groupe TCF Canada – janvier, cours intensifs du soir');
    expect(fr, isNot(contains('Plus que 0 place(s)')), reason: 'a full group says so instead');
    expect(fr, contains('Complet : liste d’attente ouverte'));
    expect(fr.trim().split('\n').last, '👉 https://www.learnfrenchwithnatives.com/fr/offres/?p=groupe-tcf-janvier');
    final en = campaignMessage(c, fr: false);
    expect(en.trim().split('\n').last, '👉 https://www.learnfrenchwithnatives.com/offers/?p=groupe-tcf-janvier');
    expect(campaignRate(13, 1900), '0.7 %');
    expect(campaignRate(0, 0), '—');
  });
}
