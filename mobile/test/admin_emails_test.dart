import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:mobile/core/api/api_client.dart';
import 'package:mobile/core/auth/token_storage.dart';
import 'package:mobile/features/admin/common/admin_kit.dart';
import 'package:mobile/features/admin/emails/email_detail_panel.dart';
import 'package:mobile/features/admin/emails/email_editor_panel.dart';
import 'package:mobile/features/admin/emails/email_model.dart';
import 'package:mobile/features/admin/emails/emails_screen.dart';
import 'package:mobile/features/admin/marketing/marketing_model.dart' show campaignPictures;

/// The keys of the picture library, in order.
final campaignPicturesForTest = [for (final (_, _, keys) in campaignPictures) ...keys];

Map<String, dynamic> _stats({int recipients = 0, int sent = 0, int queued = 0, int opened = 0, int clicked = 0, int failed = 0, int responses = 0}) => {
  'recipients': recipients, 'queued': queued, 'sent': sent, 'delivered': 0, 'failed': failed, 'bounced': 0, 'skipped': 0,
  'opened': opened, 'clicked': clicked, 'unsubscribed': 1, 'responses': responses,
  'open_rate': sent == 0 ? null : opened / sent, 'click_rate': sent == 0 ? null : clicked / sent, 'unsubscribe_rate': sent == 0 ? null : 1 / sent,
  'response_rate': sent == 0 ? null : responses / sent,
  'progress': recipients == 0 ? 0 : (recipients - queued) / recipients, 'last_sent_at': null,
};

Map<String, dynamic> _words(String l) => {
  'subject': l == 'fr' ? 'Votre groupe A1 du soir commence en janvier' : 'Your A1 evening group starts in January',
  'preheader': l == 'fr' ? 'Huit places, deux soirs par semaine.' : 'Eight seats, two evenings a week.',
  'eyebrow': l == 'fr' ? 'Nouveau groupe' : 'New group',
  'headline': l == 'fr' ? 'Parlez français dès janvier' : 'Speak French from January',
  'body': l == 'fr' ? 'Bonjour {first_name},\n\nNotre groupe A1 du soir commence en janvier.' : 'Hi {first_name},\n\nOur A1 evening group starts in January.',
  'highlights_title': null, 'highlights': l == 'fr' ? ['Mardi et jeudi, 19 h', '8 places'] : ['Tue & Thu, 7 pm'],
  'steps_title': null, 'steps': <String>[],
  'offer_label': null, 'offer_note': null, 'deadline': null,
  'primary_label': l == 'fr' ? 'Réserver ma place' : 'Book my seat', 'secondary_label': null,
  'signature': null, 'ps': null,
  'form_title': null, 'form_intro': null, 'form_submit': null, 'form_thanks_title': null, 'form_thanks_text': null,
};

const _design = {
  'preset': 'classic', 'theme': 'forest', 'header': 'band', 'logo': 'top', 'align': 'left', 'font': 'system', 'heading_font': 'system',
  'heading_size': 28, 'body_size': 16, 'radius': 16, 'button_shape': 'rounded', 'button_width': 'auto', 'spacing': 'normal', 'points': 'checks', 'card': 'border',
  'colors': {'primary': '#1f7a59', 'accent': '#ffd77a', 'header_bg': '#0c3526', 'header_text': '#ffffff', 'page_bg': '#f2f4f7', 'card_bg': '#ffffff', 'heading': '#0c3526', 'text': '#1b2333', 'muted': '#5b6578', 'soft': '#e9f4ef'},
};

final _formFields = [
  {'id': 'name', 'type': 'name', 'required': true, 'label_fr': 'Prénom et nom', 'label_en': 'Name'},
  {'id': 'email', 'type': 'email', 'required': true, 'label_fr': 'Email', 'label_en': 'Email'},
  {'id': 'level', 'type': 'select', 'required': true, 'label_fr': 'Votre niveau', 'label_en': 'Your level', 'options_fr': ['Débutant', 'A1'], 'options_en': ['Beginner', 'A1']},
];

Map<String, dynamic> _email({int id = 7, String status = 'sent', Map<String, dynamic>? stats, bool form = false}) => {
  'id': id,
  'status': status,
  'name': 'Groupe A1 du soir – relance des demandes d’essai',
  'goal': 'group',
  'language_mode': 'auto',
  'default_lang': 'fr',
  'content': {'fr': _words('fr'), 'en': _words('en')},
  'buttons': {
    'primary': form ? {'action': 'form', 'url': null} : {'action': 'link', 'url': 'https://www.learnfrenchwithnatives.com/fr/offres/'},
    'secondary': {'action': 'none', 'url': null},
  },
  'offer': {'show': false, 'regular': null, 'promo': null, 'currency': 'CAD'},
  'design': _design,
  'form': {'fields': form ? _formFields : <Map<String, dynamic>>[]},
  'image_key': null, 'promotion_id': null,
  'audience': {'sources': ['demos'], 'students': {'state': 'active', 'batches': []}, 'candidates': {'exams': []},
    'demos': {'statuses': [], 'since_days': 180, 'interest': null, 'exclude_students': true}, 'registrations': {'promotion_ids': [], 'statuses': []}},
  'excluded': [],
  'scheduled_at': null, 'started_at': status == 'draft' ? null : '2026-11-15T14:00:00Z', 'finished_at': status == 'sent' ? '2026-11-15T14:05:00Z' : null,
  'note': null, 'created_at': '2026-11-15T12:00:00Z', 'updated_at': '2026-11-15T13:00:00Z',
  'stats': stats ?? _stats(recipients: 40, sent: 39, opened: 18, clicked: 7, failed: 1),
};

final _meta = {
  'sources': {
    'students': {'active': 24, 'inactive': 7},
    'candidates': {'active': 8},
    'demos': {'total': 18, 'by_status': {'contacted': 13, 'demo_scheduled': 5}},
    'registrations': {'total': 3},
  },
  'batches': [{'id': 1, 'name': 'A1 soir', 'french_level': 'A1', 'students': 6}],
  'promotions': [{'id': 2, 'slug': 'a1-beginner-french-classes', 'title_fr': 'Cours A1 débutant', 'title_en': 'A1 beginner French classes', 'status': 'published', 'theme': 'navy', 'ends_at': null}],
  'sender': {'email': 'support@learnfrenchwithnatives.com', 'name': 'Learn French with Natives'},
  'settings': {'postal_address': '123 Rue Exemple, Montréal (QC)', 'reply_to': '', 'sender_name': ''},
  'pace': {'per_minute': 120, 'daily_max': null},
  'ai': {
    'available': true, 'engine': 'vertex', 'writing_model': 'gemini-3.8-flash', 'image_model': 'gemini-3.1-flash-image',
    'writing_choices': [
      {'id': 'gemini-3.8-flash', 'label': 'Gemini 3.8 Flash', 'state': null},
      {'id': 'gemini-4-carbon', 'label': 'Gemini 4 Carbon', 'state': null},
      {'id': 'gemini-4-argon', 'label': 'Gemini 4 Argon', 'state': null},
      {'id': 'gemini-4-hydrogen', 'label': 'Gemini 4 Hydrogen', 'state': null},
    ],
  },
  'suppressions': 2,
  'site_pages': {
    'trial_class': {'fr': 'https://www.learnfrenchwithnatives.com/fr/?demo=1', 'en': 'https://www.learnfrenchwithnatives.com/?demo=1'},
    'offers': {'fr': 'https://www.learnfrenchwithnatives.com/fr/offres/', 'en': 'https://www.learnfrenchwithnatives.com/offers/'},
  },
  'design': {
    'presets': {for (final p in emailPresets) p: {..._design, 'preset': p, 'theme': 'navy', 'colors': {..._design['colors'] as Map, 'primary': '#1d4577', 'header_bg': '#0b1733'}}},
    'brand': {
      'navy': {'primary': '#1d4577', 'accent': '#f2b632', 'header_bg': '#0b1733', 'soft': '#edf1f5', 'heading': '#0b1733'},
      'plum': {'primary': '#6a45a3', 'accent': '#f6c66b', 'header_bg': '#2a1849', 'soft': '#f1ecf8', 'heading': '#2a1849'},
    },
    'fonts': emailFonts,
  },
  'form_field_types': emailFieldTypes,
};

class _FakeEmailApi extends ApiClient {
  final bool installed;
  _FakeEmailApi({this.installed = true}) : super(customBaseUrl: 'http://test.invalid/api');
  final sent = <String, dynamic>{};

  Map<String, dynamic>? _route(String path) => switch (path) {
    '/admin/email-campaigns' => {
      'campaigns': [
        _email(),
        _email(id: 8, status: 'draft', stats: _stats()),
        _email(id: 9, status: 'sending', stats: _stats(recipients: 40, sent: 12, queued: 28, opened: 3, clicked: 1)),
        _email(id: 10, form: true, stats: _stats(recipients: 20, sent: 20, opened: 9, clicked: 5, responses: 2)),
      ],
      'summary': {'sent_30d': 51, 'opened_30d': 21, 'clicked_30d': 8, 'unsubscribed_30d': 1, 'open_rate_30d': 0.41, 'click_rate_30d': 0.157, 'sending': 1, 'scheduled': 0, 'new_responses': 1},
    },
    '/admin/email-campaigns/meta' => _meta,
    '/admin/email-campaigns/7' => {
      'campaign': _email(),
      'links': [{'idx': 1, 'url': 'https://www.learnfrenchwithnatives.com/fr/offres/', 'label': 'Réserver ma place', 'clicks': 9, 'people': 7}],
      'days': [], 'by_source': [{'source': 'demo', 'recipients': 40, 'opened': 18, 'clicked': 7}], 'missing': [],
    },
    '/admin/email-campaigns/8' => {'campaign': _email(id: 8, status: 'draft', stats: _stats()), 'links': [], 'days': [], 'by_source': [], 'missing': []},
    '/admin/email-campaigns/9' => {
      'campaign': _email(id: 9, status: 'sending', stats: _stats(recipients: 40, sent: 12, queued: 28)),
      'links': [], 'days': [], 'by_source': [], 'missing': [],
    },
    '/admin/email-campaigns/10' => {
      'campaign': _email(id: 10, form: true, stats: _stats(recipients: 20, sent: 20, opened: 9, clicked: 5, responses: 2)),
      'links': [{'idx': 1, 'url': 'form', 'label': 'Je réponds', 'clicks': 6, 'people': 5}],
      'days': [], 'by_source': [], 'missing': [],
    },
    _ when path.endsWith('/responses') => {
      'responses': [
        {'id': 1, 'name': 'Eva Lopez', 'email': 'eva@example.com', 'phone': '+1 514 555 0101', 'lang': 'fr', 'answers': {'name': 'Eva Lopez', 'email': 'eva@example.com', 'level': 'A1'},
          'status': 'new', 'notes': '', 'created_at': '2026-11-15T15:00:00Z', 'source': 'demo'},
        {'id': 2, 'name': 'Sam Lee', 'email': 'sam@example.com', 'phone': null, 'lang': 'en', 'answers': {'level': 'Beginner'},
          'status': 'done', 'notes': 'Called', 'created_at': '2026-11-15T16:00:00Z', 'source': 'student'},
      ],
      'fields': _formFields,
    },
    _ when path.endsWith('/recipients') => {
      'recipients': [
        {'id': 1, 'email': 'eva@example.com', 'name': 'Eva Lopez', 'lang': 'fr', 'source': 'demo', 'status': 'sent', 'error': null,
          'sent_at': '2026-11-15T14:01:00Z', 'opened_at': '2026-11-15T15:00:00Z', 'opens': 2, 'clicked_at': null, 'clicks': 0, 'unsubscribed_at': null},
      ],
      'total': 1,
    },
    _ => null,
  };

  Response<T> _ok<T>(String path, dynamic data) => Response<T>(requestOptions: RequestOptions(path: path), statusCode: 200, data: data as T);

  void _check() {
    if (!installed) throw ApiException(message: 'Run backend/database/run-email-campaigns-migration.js', statusCode: 503, details: {'code': 'EMAILS_NOT_MIGRATED'});
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
    if (path == '/admin/email-campaigns/audience') {
      return _ok<T>(path, {
        'counts': {'total': 2, 'by_source': {'student': 1, 'candidate': 0, 'registration': 0, 'demo': 1}, 'suppressed': 1, 'excluded': 0, 'duplicates': 1, 'invalid': 0},
        'people': [
          {'email': 'ana@example.com', 'name': 'Ana Silva', 'first_name': 'Ana', 'lang': null, 'source': 'student'},
          {'email': 'eva@example.com', 'name': 'Eva Lopez', 'first_name': 'Eva', 'lang': 'fr', 'source': 'demo'},
        ],
      });
    }
    if (path == '/admin/email-campaigns/ai/draft') {
      final primary = J.s(J.map(J.map(data)['primary'])['action']);
      return _ok<T>(path, {
        'fields': {
          'name': 'Relance A1 janvier',
          'goal': 'survey',
          'promotion_id': null,
          'content': {
            'fr': {..._words('fr'), 'subject': 'Votre groupe A1 commence en janvier', 'primary_label': 'Je réponds', 'form_title': 'Réservez votre place'},
            'en': {..._words('en'), 'subject': 'Your A1 group starts in January', 'primary_label': 'Reply now', 'form_title': 'Book your seat'},
          },
          'buttons': {'primary': {'action': primary, 'url': null}, 'secondary': {'action': 'none', 'url': null}},
          'offer': {'show': true, 'regular': 600, 'promo': 480, 'currency': 'CAD'},
          'form': {'fields': _formFields},
          'design': {..._design, 'preset': 'bold', 'theme': 'plum'},
        },
        'notes': [
          if (J.map(data)['model'] == 'gemini-4-carbon') 'Gemini 4 Carbon is not available on your project (model not found, or no access yet): Gemini 3.8 Flash did it instead.',
          'La date exacte du premier cours n’a pas été donnée.',
        ],
        'subject_ideas': {'fr': ['Apprenez le français le soir dès janvier'], 'en': ['Learn French in the evening from January']},
        'image_prompt': J.map(data)['picture_prompt'] == null ? 'An adult learner at home in the evening.' : '${J.map(data)['picture_prompt']}, warm lamp light, no text.',
        'model': 'gemini-3.8-flash', 'model_label': 'Gemini 3.8 Flash', 'requested_model': J.map(data)['model'], 'engine': 'vertex',
        'choices': [
          {'id': 'gemini-3.8-flash', 'label': 'Gemini 3.8 Flash', 'state': 'ok'},
          {'id': 'gemini-4-carbon', 'label': 'Gemini 4 Carbon', 'state': J.map(data)['model'] == 'gemini-4-carbon' ? 'missing' : null},
          {'id': 'gemini-4-argon', 'label': 'Gemini 4 Argon', 'state': null},
          {'id': 'gemini-4-hydrogen', 'label': 'Gemini 4 Hydrogen', 'state': null},
        ],
      });
    }
    if (path == '/admin/email-campaigns/ai/image') {
      return _ok<T>(path, {'image_key': 'ai-0123456789ab', 'url': 'http://test.invalid/api/public/email/img/ai-0123456789ab.jpg', 'model': 'gemini-3.1-flash-image', 'warning': null});
    }
    if (path == '/admin/email-campaigns/ai/models/check') {
      return _ok<T>(path, {
        'choices': [
          {'id': 'gemini-3.8-flash', 'label': 'Gemini 3.8 Flash', 'state': 'ok'},
          {'id': 'gemini-4-carbon', 'label': 'Gemini 4 Carbon', 'state': 'missing'},
          {'id': 'gemini-4-argon', 'label': 'Gemini 4 Argon', 'state': 'missing'},
          {'id': 'gemini-4-hydrogen', 'label': 'Gemini 4 Hydrogen', 'state': 'missing'},
        ],
      });
    }
    if (path == '/admin/email-campaigns/ai/designs') {
      return _ok<T>(path, {
        'designs': [
          {..._design, 'preset': 'editorial', 'header': 'centered', 'heading_font': 'georgia', 'name_fr': 'Élégance académique', 'name_en': 'Academic elegance', 'rationale_fr': 'Centré et sobre.', 'rationale_en': 'Centred and calm.'},
          {..._design, 'preset': 'bold', 'button_shape': 'pill', 'name_fr': 'Direct', 'name_en': 'Direct', 'rationale_fr': 'Un grand titre.', 'rationale_en': 'A big headline.'},
          {..._design, 'preset': 'minimal', 'header': 'none', 'name_fr': 'Épuré', 'name_en': 'Minimal', 'rationale_fr': 'Comme une lettre.', 'rationale_en': 'Like a letter.'},
        ],
        'model': 'gemini-3.8-flash', 'engine': 'vertex',
        'notice': J.map(data)['model'] == 'gemini-4-argon' ? 'Gemini 4 Argon is not available on your project: Gemini 3.8 Flash did it instead.' : null,
      });
    }
    if (path == '/admin/email-campaigns') return _ok<T>(path, {'campaign': _email(id: 51, status: 'draft', stats: _stats())});
    if (path.endsWith('/test')) return _ok<T>(path, {'sent': [{'to': 'ada@example.com', 'lang': 'fr'}]});
    return _ok<T>(path, {'campaign': _email(status: 'sending', stats: _stats(recipients: 40, queued: 40))});
  }

  @override
  Future<Response<T>> put<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    _check();
    sent['PUT $path'] = data;
    return _ok<T>(path, {'campaign': _email(id: 8, status: 'draft', stats: _stats()), 'settings': J.map(data)});
  }

  @override
  Future<Response<T>> patch<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    _check();
    sent['PATCH $path'] = data;
    return _ok<T>(path, {'response': J.map(data)});
  }

  @override
  Future<Response<T>> delete<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) async {
    _check();
    sent['DELETE $path'] = true;
    return _ok<T>(path, {'deleted': 8});
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
const _tall = Size(1024, 4000);

Future<_FakeEmailApi> _show(WidgetTester tester, Widget screen, {Size size = _phone, String lang = 'en', bool installed = true}) async {
  tester.view.physicalSize = size;
  tester.view.devicePixelRatio = 1;
  addTearDown(tester.view.reset);
  final api = _FakeEmailApi(installed: installed);
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
  return api;
}

TextEditingController _field(WidgetTester tester, String key) =>
    tester.widget<TextField>(find.descendant(of: find.byKey(Key(key)), matching: find.byType(TextField))).controller!;

/// Scrolls the panel down until the widget is built (long panels build lazily).
Future<void> _reach(WidgetTester tester, Finder f) async {
  if (f.evaluate().isEmpty) await tester.scrollUntilVisible(f, 400, scrollable: find.byType(Scrollable).first);
}

Future<void> _tap(WidgetTester tester, Finder f) async {
  await _reach(tester, f);
  await tester.ensureVisible(f);
  await tester.pumpAndSettle();
  await tester.tap(f);
  await tester.pumpAndSettle();
}

void main() {
  setUpAll(() async {
    await initializeDateFormatting('fr_FR');
    await initializeDateFormatting('en_US');
  });

  final screens = <String, Widget Function()>{
    'email list': () => const EmailsScreen(),
    'new email': () => EmailEditorPanel(meta: _meta),
    'edit email': () => EmailEditorPanel(campaign: EmailCampaign(_email(id: 8, status: 'draft')), meta: _meta),
    'edit a form email': () => EmailEditorPanel(campaign: EmailCampaign(_email(id: 8, status: 'draft', form: true)), meta: _meta),
    'sent email': () => EmailDetailPanel(emailId: 7, meta: _meta),
    'draft email': () => EmailDetailPanel(emailId: 8, meta: _meta),
    'email sending': () => EmailDetailPanel(emailId: 9, meta: _meta),
    'email with answers': () => EmailDetailPanel(emailId: 10, meta: _meta),
  };
  for (final (size, lang) in [(_phone, 'en'), (_phone, 'fr'), (_tablet, 'fr'), (const Size(320, 640), 'fr')]) {
    for (final entry in screens.entries) {
      testWidgets('${entry.key} fits a ${size.width.round()} px screen ($lang)', (tester) async {
        await _show(tester, entry.value(), size: size, lang: lang);
        expect(tester.takeException(), isNull, reason: 'nothing overflows or throws');
      });
    }
  }

  testWidgets('the list shows the emails, their state, their buttons and the 30-day figures', (tester) async {
    await _show(tester, const EmailsScreen(), size: _tablet);
    expect(find.text('Email campaigns'), findsOneWidget);
    expect(find.text('51'), findsOneWidget, reason: 'sent in 30 days');
    expect(find.text('41%'), findsOneWidget, reason: 'opened');
    expect(find.text('New answers'), findsOneWidget);
    expect(find.text('A form'), findsWidgets, reason: 'the form email says what its button opens');
    expect(find.text('2 answer(s)'), findsOneWidget);
    expect(find.text('Sending'), findsWidgets);
    await tester.tap(find.widgetWithText(ChoiceChip, 'Drafts  1'));
    await tester.pumpAndSettle();
    expect(find.text('Sent'), findsNothing);
  });

  testWidgets('in French, rates read « 41 % »', (tester) async {
    await _show(tester, const EmailsScreen(), size: _tablet, lang: 'fr');
    expect(find.text('41 %'), findsOneWidget);
    expect(find.text('Nouvelles réponses'), findsOneWidget);
  });

  testWidgets('before the migration, the screen says how to install it', (tester) async {
    await _show(tester, const EmailsScreen(), installed: false);
    expect(find.text('Email campaigns are not installed yet'), findsOneWidget);
  });

  testWidgets('choosing the lists counts the people (once each, unsubscribed left out)', (tester) async {
    final api = await _show(tester, EmailEditorPanel(meta: _meta), size: _tall);
    await tester.tap(find.byKey(const Key('email-source-students')));
    await tester.pumpAndSettle(const Duration(milliseconds: 400));
    final body = api.sent['/admin/email-campaigns/audience'] as Map;
    expect((body['audience'] as Map)['sources'], ['students']);
    expect(find.textContaining('1 in two lists, counted once'), findsOneWidget);
    expect(find.textContaining('1 unsubscribed, left out'), findsOneWidget);
    expect(tester.takeException(), isNull);
  });

  testWidgets('the AI writes both languages, with a form, and its layout when asked', (tester) async {
    final api = await _show(tester, EmailEditorPanel(meta: _meta), size: _tall);
    await tester.tap(find.byKey(const Key('email-ai-primary-form')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('email-ai-brief')), 'New A1 evening group in January, 8 seats, 480 instead of 600. Ask their level.');
    await tester.pump();
    await tester.tap(find.byKey(const Key('email-ai-go')));
    await tester.pumpAndSettle();

    final ask = api.sent['/admin/email-campaigns/ai/draft'] as Map;
    expect(ask['primary'], {'action': 'form', 'url': null});
    expect(ask['secondary'], {'action': 'none', 'url': null});
    expect(find.textContaining('Written by Gemini 3.8 Flash in French and English'), findsOneWidget);
    expect(find.textContaining('La date exacte'), findsOneWidget);
    expect(_field(tester, 'email-subject-fr').text, 'Votre groupe A1 commence en janvier');
    expect(find.text('THE FORM'), findsOneWidget, reason: 'the form section opens');
    await _reach(tester, find.byKey(const Key('email-form-label-fr-2')));
    expect(_field(tester, 'email-form-label-fr-2').text, 'Votre niveau');

    await tester.tap(find.byKey(const Key('email-save')));
    await tester.pumpAndSettle();
    final saved = api.sent['/admin/email-campaigns'] as Map;
    expect(((saved['content'] as Map)['en'] as Map)['subject'], 'Your A1 group starts in January');
    expect(((saved['content'] as Map)['fr'] as Map)['form_title'], 'Réservez votre place');
    expect((saved['buttons'] as Map)['primary'], {'action': 'form', 'url': null});
    final level = ((saved['form'] as Map)['fields'] as List).firstWhere((f) => f['id'] == 'level') as Map;
    expect(level['options_en'], ['Beginner', 'A1']);
    expect((saved['offer'] as Map)['promo'], 480);
    expect((saved['design'] as Map)['preset'], 'bold', reason: 'a new email takes the layout the AI chose');
    expect(saved['goal'], 'survey');
  });

  testWidgets('the AI writes with the model picked, and adds the picture described', (tester) async {
    final api = await _show(tester, EmailEditorPanel(meta: _meta), size: _tall);
    await _tap(tester, find.byKey(const Key('email-ai-model')));
    expect(find.byKey(const Key('email-ai-model-gemini-4-hydrogen')), findsOneWidget, reason: 'Vertex offers the Gemini 4 models');
    await _tap(tester, find.byKey(const Key('email-ai-model-gemini-4-carbon')));
    expect(find.text('Gemini 4 Carbon'), findsOneWidget, reason: 'the foot shows the model picked');
    await _tap(tester, find.byKey(const Key('email-ai-picture')));
    await tester.enterText(find.byKey(const Key('email-ai-picture-prompt')), 'An adult learner at her kitchen table, smiling at a laptop');
    await _tap(tester, find.byKey(const Key('email-ai-picture-place-inline')));
    await tester.enterText(find.byKey(const Key('email-ai-brief')), 'New B1 conversation group on Saturday mornings from January 10.');
    await tester.pump();
    await _tap(tester, find.byKey(const Key('email-ai-go')));

    final ask = api.sent['/admin/email-campaigns/ai/draft'] as Map;
    expect(ask['model'], 'gemini-4-carbon');
    expect(ask['picture'], isTrue);
    expect(ask['picture_prompt'], 'An adult learner at her kitchen table, smiling at a laptop');
    final paint = api.sent['/admin/email-campaigns/ai/image'] as Map;
    expect(paint['prompt'], 'An adult learner at her kitchen table, smiling at a laptop, warm lamp light, no text.', reason: 'the description the writer refined');
    expect(find.textContaining('Gemini 4 Carbon is not available on your project'), findsOneWidget, reason: 'the admin is told who wrote it');
    expect(find.textContaining('Written by Gemini 3.8 Flash'), findsOneWidget);
    expect(find.text('Picture added · under the headline'), findsOneWidget);
    expect(find.text('Gemini 4 Carbon is not available on your Vertex project yet: Gemini 3.8 will write instead.'), findsOneWidget);

    await _tap(tester, find.byKey(const Key('email-save')));
    final saved = api.sent['/admin/email-campaigns'] as Map;
    expect(saved['image_key'], 'ai-0123456789ab');
    expect((saved['design'] as Map)['header'], isNot('hero'), reason: 'under the headline: no « Photo » header');
    expect(tester.takeException(), isNull);
  });

  testWidgets('« Check » shows which models answer on the project', (tester) async {
    final api = await _show(tester, EmailEditorPanel(meta: _meta), size: _tall);
    await _tap(tester, find.byKey(const Key('email-ai-model')));
    await _tap(tester, find.byKey(const Key('email-ai-check-models')));
    expect(api.sent.containsKey('/admin/email-campaigns/ai/models/check'), isTrue);
    expect(find.text('not available on your project'), findsNWidgets(3), reason: 'each model says what it did');
    expect(find.text('answers'), findsOneWidget);
    await _tap(tester, find.byKey(const Key('email-ai-model-gemini-4-argon')));
    expect(find.textContaining('is not available on your Vertex project yet'), findsOneWidget);
    await _tap(tester, find.byKey(const Key('email-ai-model')));
    await _tap(tester, find.byKey(const Key('email-ai-model-gemini-3.8-flash')));
    expect(find.textContaining('is not available on your Vertex project yet'), findsNothing);
  });

  testWidgets('the art director uses the model picked, and says when another one stood in', (tester) async {
    final api = await _show(tester, EmailEditorPanel(campaign: EmailCampaign(_email(id: 8, status: 'draft')), meta: _meta), size: _tall);
    await _tap(tester, find.byKey(const Key('email-ai-model')));
    await _tap(tester, find.byKey(const Key('email-ai-model-gemini-4-argon')));
    await _tap(tester, find.byKey(const Key('email-design-go')));
    expect((api.sent['/admin/email-campaigns/ai/designs'] as Map)['model'], 'gemini-4-argon');
    expect((api.sent['/admin/email-campaigns/ai/designs'] as Map)['lang'], 'en');
    expect(find.byKey(const Key('email-design-notice')), findsOneWidget);
  });

  testWidgets('with the developer engine, no model to pick', (tester) async {
    final meta = {..._meta, 'ai': {...J.map(_meta['ai']), 'engine': 'developer'}};
    await _show(tester, EmailEditorPanel(meta: meta), size: _tall);
    expect(find.byKey(const Key('email-ai-model')), findsNothing);
  });

  testWidgets('a picture from the library, at the top or under the headline, removed', (tester) async {
    final api = await _show(tester, EmailEditorPanel(campaign: EmailCampaign(_email(id: 8, status: 'draft')), meta: _meta), size: _tall);
    await _tap(tester, find.byKey(const Key('email-picture-library')));
    final first = campaignPicturesForTest.first;
    await _tap(tester, find.byKey(Key('email-library-$first')));
    await _tap(tester, find.byKey(const Key('email-picture-place-top')));
    await _tap(tester, find.byKey(const Key('email-save')));
    final saved = api.sent['PUT /admin/email-campaigns/8'] as Map;
    expect(saved['image_key'], first);
    expect((saved['design'] as Map)['header'], 'hero');
  });

  testWidgets('a picture at the top moves under the headline, then is removed', (tester) async {
    final first = campaignPicturesForTest.first;
    final withPicture = {..._email(id: 8, status: 'draft'), 'image_key': first, 'design': {..._design, 'header': 'hero'}};
    final api = await _show(tester, EmailEditorPanel(campaign: EmailCampaign(withPicture), meta: _meta), size: _tall);
    await _tap(tester, find.byKey(const Key('email-picture-place-inline')));
    await _tap(tester, find.byKey(const Key('email-picture-remove')));
    await _tap(tester, find.byKey(const Key('email-save')));
    final saved = api.sent['PUT /admin/email-campaigns/8'] as Map;
    expect(saved['image_key'], isNull);
    expect((saved['design'] as Map)['header'], 'band');
  });

  testWidgets('a picture made from a description, in the Design part', (tester) async {
    final api = await _show(tester, EmailEditorPanel(campaign: EmailCampaign(_email(id: 8, status: 'draft')), meta: _meta), size: _tall);
    await _reach(tester, find.byKey(const Key('email-picture-prompt')));
    await tester.enterText(find.byKey(const Key('email-picture-prompt')), 'Two adults practising French in a bright Montréal café');
    await _tap(tester, find.byKey(const Key('email-picture-make')));
    expect((api.sent['/admin/email-campaigns/ai/image'] as Map)['prompt'], 'Two adults practising French in a bright Montréal café');
    expect((api.sent['/admin/email-campaigns/ai/image'] as Map)['theme'], 'forest');
    expect(find.text('Another picture'), findsOneWidget);
  });

  testWidgets('a WhatsApp button needs a real invitation link before the AI is asked', (tester) async {
    final api = await _show(tester, EmailEditorPanel(meta: _meta), size: _tall);
    await tester.tap(find.byKey(const Key('email-ai-primary-whatsapp')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('email-ai-whatsapp')), 'https://example.com/not-whatsapp');
    await tester.enterText(find.byKey(const Key('email-ai-brief')), 'Invite our students to the new conversation group.');
    await tester.pump();
    await tester.tap(find.byKey(const Key('email-ai-go')));
    await tester.pumpAndSettle();
    expect(find.text('Check the button links above.'), findsOneWidget, reason: 'the button says why it waits');
    expect(tester.widget<FilledButton>(find.byKey(const Key('email-ai-go'))).onPressed, isNull, reason: 'a wrong link: the AI cannot be asked');
    expect(api.sent['/admin/email-campaigns/ai/draft'], isNull, reason: 'nothing asked with a wrong link');

    await tester.enterText(find.byKey(const Key('email-ai-whatsapp')), 'https://chat.whatsapp.com/AbCdEfGhIjKlMn12');
    await tester.pump();
    await tester.tap(find.byKey(const Key('email-ai-go')));
    await tester.pumpAndSettle();
    expect((api.sent['/admin/email-campaigns/ai/draft'] as Map)['primary'], {'action': 'whatsapp', 'url': 'https://chat.whatsapp.com/AbCdEfGhIjKlMn12'});
  });

  testWidgets('the form builder starts with the usual questions; questions are added and removed', (tester) async {
    final api = await _show(tester, EmailEditorPanel(meta: _meta), size: _tall);
    await tester.enterText(find.byKey(const Key('email-subject-fr')), 'Votre niveau de français ?');
    await _tap(tester, find.byKey(const Key('email-primary-action-form')));
    expect(_field(tester, 'email-form-label-en-0').text, 'First and last name');
    expect(_field(tester, 'email-form-label-en-2').text, 'Phone or WhatsApp');

    await _tap(tester, find.byKey(const Key('email-form-template-level')));
    expect(_field(tester, 'email-form-label-fr-3').text, 'Votre niveau de français');
    await _tap(tester, find.byKey(const Key('email-form-remove-2')));
    await _tap(tester, find.byKey(const Key('email-save')));
    final saved = api.sent['/admin/email-campaigns'] as Map;
    final fields = (saved['form'] as Map)['fields'] as List;
    expect(fields.map((f) => f['id']), ['name', 'email', 'level']);
    expect((fields[2] as Map)['options_en'], contains('I don’t know'));
  });

  testWidgets('a form without an email question is not saved', (tester) async {
    final api = await _show(tester, EmailEditorPanel(campaign: EmailCampaign(_email(id: 8, status: 'draft', form: true)), meta: _meta), size: _tall);
    await _tap(tester, find.byKey(const Key('email-form-remove-1')));
    await _tap(tester, find.byKey(const Key('email-save')));
    expect(api.sent['PUT /admin/email-campaigns/8'], isNull);
    // The message is at the top of the panel.
    await tester.scrollUntilVisible(find.text('The form needs an « Email » question.'), -400, scrollable: find.byType(Scrollable).first);
    expect(find.text('The form needs an « Email » question.'), findsOneWidget);
  });

  testWidgets('the art director proposes three designs; one is used and saved', (tester) async {
    final api = await _show(tester, EmailEditorPanel(campaign: EmailCampaign(_email(id: 8, status: 'draft')), meta: _meta), size: _tall);
    await _tap(tester, find.byKey(const Key('email-style-elegant')));
    await _tap(tester, find.byKey(const Key('email-color-plum')));
    await _tap(tester, find.byKey(const Key('email-design-go')));
    final ask = api.sent['/admin/email-campaigns/ai/designs'] as Map;
    expect(ask['wishes'], {'style': 'elegant', 'color': 'plum', 'header': null, 'notes': ''});
    expect(((ask['campaign'] as Map)['content'] as Map)['fr'], isA<Map>(), reason: 'it reads the email');
    expect(find.text('Academic elegance'), findsOneWidget);
    expect(find.text('Minimal'), findsWidgets);

    await _tap(tester, find.byKey(const Key('email-proposal-use-0')));
    expect(find.byKey(const Key('email-design-undo')), findsOneWidget);
    await _tap(tester, find.byKey(const Key('email-save')));
    final saved = api.sent['PUT /admin/email-campaigns/8'] as Map;
    expect((saved['design'] as Map)['preset'], 'editorial');
    expect((saved['design'] as Map)['heading_font'], 'georgia');
  });

  testWidgets('a layout and a palette change the design in one tap', (tester) async {
    final api = await _show(tester, EmailEditorPanel(campaign: EmailCampaign(_email(id: 8, status: 'draft')), meta: _meta), size: _tall);
    await _tap(tester, find.byKey(const Key('email-preset-hero')));
    await _tap(tester, find.byKey(const Key('email-theme-plum')));
    await _tap(tester, find.byKey(const Key('email-save')));
    final design = (api.sent['PUT /admin/email-campaigns/8'] as Map)['design'] as Map;
    expect(design['preset'], 'hero');
    expect(design['theme'], 'plum');
    expect((design['colors'] as Map)['primary'], '#6a45a3');
  });

  testWidgets('a draft sends a test, then goes out after a confirmation', (tester) async {
    final api = await _show(tester, EmailDetailPanel(emailId: 8, meta: _meta), size: const Size(1024, 2000));
    await tester.tap(find.byKey(const Key('email-test')));
    await tester.pumpAndSettle();
    await tester.enterText(find.byKey(const Key('email-test-to')), 'ada@example.com');
    await tester.tap(find.text('Send the test'));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/email-campaigns/8/test'], {'to': 'ada@example.com'});

    await tester.tap(find.byKey(const Key('email-send')));
    await tester.pumpAndSettle();
    expect(find.text('Send to 2 people?'), findsOneWidget, reason: 'the real count before sending');
    await tester.tap(find.descendant(of: find.byType(AlertDialog), matching: find.text('Send')));
    await tester.pumpAndSettle();
    expect(api.sent['/admin/email-campaigns/8/send'], <String, dynamic>{});
  });

  testWidgets('an email going out shows its progress and can be paused', (tester) async {
    final api = await _show(tester, EmailDetailPanel(emailId: 9, meta: _meta), size: const Size(1024, 2000));
    final bar = tester.widget<LinearProgressIndicator>(find.byKey(const Key('email-progress')));
    expect(bar.value, closeTo(0.3, 0.01));
    expect(find.text('12 of 40 sent · about 120 a minute'), findsOneWidget);
    await tester.tap(find.byKey(const Key('email-pause')));
    await tester.pump();
    expect(api.sent.containsKey('/admin/email-campaigns/9/pause'), isTrue);
    // The page stops following the figures once it is gone.
    await tester.pumpWidget(const SizedBox());
  });

  testWidgets('a sent email shows its results, its links and who did what', (tester) async {
    await _show(tester, EmailDetailPanel(emailId: 7, meta: _meta), size: const Size(1024, 2400));
    expect(find.text('39 / 40'), findsOneWidget);
    expect(find.text('46.2%'), findsOneWidget, reason: 'opened: 18 of 39');
    expect(find.text('7 people · 9 click(s)'), findsOneWidget);
    expect(find.text('Eva Lopez'), findsOneWidget);
    expect(find.textContaining('ANSWERS'), findsNothing, reason: 'no form, no answers section');
  });

  testWidgets('the answers to the form are listed and followed up', (tester) async {
    final api = await _show(tester, EmailDetailPanel(emailId: 10, meta: _meta), size: const Size(1024, 2400));
    expect(find.text('ANSWERS (2) · 1 NEW'), findsOneWidget);
    expect(find.text('Your level : A1'), findsOneWidget);
    expect(find.text('The form'), findsOneWidget, reason: 'the form link in the results');

    await _tap(tester, find.byKey(const Key('email-answer-1')));
    expect(find.text('+1 514 555 0101'), findsOneWidget);
    expect(find.text('WhatsApp'), findsOneWidget);
    await _tap(tester, find.byKey(const Key('email-answer-status-contacted')));
    expect(api.sent['PATCH /admin/email-campaigns/10/responses/1'], {'status': 'contacted'});
    await tester.enterText(find.byKey(const Key('email-answer-notes')), 'Called on Monday');
    await _tap(tester, find.byKey(const Key('email-answer-save-notes')));
    expect(api.sent['PATCH /admin/email-campaigns/10/responses/1'], {'notes': 'Called on Monday'});
    await _tap(tester, find.byKey(const Key('email-answer-done')));
    expect(tester.takeException(), isNull);
  });

  test('what is missing before sending, said like the server', () {
    final f = EmailCampaign(_email(id: 8, status: 'draft')).raw;
    Map<String, dynamic> withButtons(Map<String, dynamic> primary, [Map<String, dynamic>? secondary]) =>
        {...f, 'buttons': {'primary': primary, 'secondary': secondary ?? {'action': 'none', 'url': null}}};
    Map<String, dynamic> withWords(String lang, Map<String, dynamic> patch) =>
        {...f, 'content': {...f['content'] as Map, lang: {...(f['content'] as Map)[lang] as Map, ...patch}}};

    expect(emailMissing(f, false, postalAddress: '123 Rue', recipients: 4), isEmpty);
    expect(emailMissing(withWords('fr', {'subject': null}), false), contains('a subject in French'));
    expect(emailMissing({...withWords('en', {'body': ''}), 'language_mode': 'both'}, false), contains('a message in English'));
    expect(emailMissing(withButtons({'action': 'link', 'url': null}), false), contains('the main button’s link'));
    expect(emailMissing(withButtons({'action': 'link', 'url': 'http://x.com'}), false), contains('the main button’s link starting with https://'));
    expect(emailMissing(withButtons({'action': 'whatsapp', 'url': null}), true), contains('le lien du groupe WhatsApp'));
    expect(emailMissing(withButtons({'action': 'whatsapp', 'url': 'https://wa.example.com/x'}), false), contains('a WhatsApp invitation link'));
    expect(emailMissing(withButtons({'action': 'form', 'url': null}), false), contains('an « Email » question in the form'));
    expect(emailMissing({...withButtons({'action': 'form', 'url': null}), 'form': {'fields': _formFields}}, false), isEmpty);
    expect(emailMissing(f, true, postalAddress: ''), contains('l’adresse postale de l’école (Expéditeur)'));
  });

  test('rates, people, choices, palettes and answers', () {
    expect(emailRate(0.4615), '46.2%');
    expect(emailRate(0.4615, fr: true), '46,2 %');
    expect(emailRate(0.5, fr: true), '50 %');
    expect(emailRate(null), '—');
    expect(emailPeople(1, false), '1 person');
    expect(emailPeople(0, true), '0 personne');
    expect(emailPeople(3, true), '3 personnes');
    expect(isWhatsAppInvite('https://chat.whatsapp.com/AbCdEfGhIjKlMn12'), isTrue);
    expect(isWhatsAppInvite('https://example.com/AbCdEfGhIjKlMn12'), isFalse);

    final existing = [newFormField('text', [])];
    expect(existing.first['id'], 'text');
    expect(newFormField('text', existing)['id'], 'text_2');
    expect(newFormField('radio', existing)['options_fr'], isEmpty);
    expect(newFormField('email', existing)['required'], isTrue);

    final d = recolorDesign(designCopy(_design), 'plum', _meta);
    expect(d['theme'], 'plum');
    expect(J.map(d['colors'])['primary'], '#6a45a3');
    expect(J.map(d['colors'])['header_text'], '#ffffff');
    final white = recolorDesign({...designCopy(_design), 'colors': {...J.map(_design['colors']), 'header_bg': '#ffffff'}}, 'plum', _meta);
    expect(J.map(white['colors'])['header_bg'], '#ffffff', reason: 'a white header stays white');
    expect(J.map(white['colors'])['header_text'], '#2a1849', reason: 'its words take the dark colour');

    expect(placePicture(designCopy(_design), 'top')['header'], 'hero');
    expect(placePicture({...designCopy(_design), 'header': 'hero'}, 'inline')['header'], 'band');
    expect(placePicture({...designCopy(_design), 'header': 'logo'}, 'inline')['header'], 'logo', reason: 'another header is kept');
    expect(pictureOf({'header': 'hero'}), 'top');
    expect(modelChoices([{'id': 'gemini-4-carbon', 'label': '', 'state': 'missing'}, {'id': ''}]), [{'id': 'gemini-4-carbon', 'label': 'gemini-4-carbon', 'state': 'missing'}]);
    expect(modelStateLabel('missing', true), 'pas disponible sur votre projet');
    expect(modelStateLabel(null, false), isNull);

    const a = FormAnswer({'answers': {'slots': ['Soir', 'Week-end'], 'level': 'A1'}});
    expect(a.answer('slots'), 'Soir, Week-end');
    expect(a.answer('missing'), '');
    expect(fieldLabel({'id': 'x', 'label_en': 'Level'}, true), 'Level', reason: 'the other language when one is missing');
  });
}
