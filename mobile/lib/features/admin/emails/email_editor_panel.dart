import 'dart:async';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../marketing/campaign_ai.dart' show AiMark, aiTimeZone;
import '../marketing/marketing_model.dart' show themeOf;
import '../marketing/marketing_widgets.dart' show CampaignPicture, MarketingBanner;
import 'email_design_section.dart';
import 'email_form_builder.dart';
import 'email_model.dart';
import 'email_picture_section.dart';

/// The AI writer can take up to a minute.
final _aiOptions = Options(receiveTimeout: const Duration(seconds: 150), sendTimeout: const Duration(seconds: 30));

/// The text fields of one language (the lists are written one per line).
const _textKeys = [...emailWordKeys, ...emailListKeys];

/// Writes or changes an email: who receives it, what it says in French and in
/// English (the AI can write it all), its buttons (a page, a form, a WhatsApp
/// group) and the form's questions, its design, its language. Pops the id of
/// the saved email, or nothing.
class EmailEditorPanel extends ConsumerStatefulWidget {
  final EmailCampaign? campaign;
  final Map<String, dynamic> meta;
  const EmailEditorPanel({super.key, this.campaign, required this.meta});

  @override
  ConsumerState<EmailEditorPanel> createState() => _EmailEditorPanelState();
}

class _EmailEditorPanelState extends ConsumerState<EmailEditorPanel> {
  EmailCampaign? get _c => widget.campaign;
  late int? _id = _c?.id;

  // What it says, in both languages.
  late final Map<String, TextEditingController> _t = {
    for (final l in ['fr', 'en'])
      for (final k in _textKeys) '${k}_$l': TextEditingController(text: _initial(k, l)),
  };
  late final _name = TextEditingController(text: J.s(_c?.raw['name']));

  // The buttons.
  late String _primary = J.s(_c?.buttons['primary']['action'] ?? 'link');
  late String _secondary = J.s(_c?.buttons['secondary']['action'] ?? 'none');
  late final _url1 = TextEditingController(text: J.s(_c?.buttons['primary']['url']));
  late final _url2 = TextEditingController(text: J.s(_c?.buttons['secondary']['url']));

  // The price box.
  late bool _offerShow = _c?.offer['show'] == true;
  late final _regular = TextEditingController(text: _c?.offer['regular'] == null ? '' : '${_c!.offer['regular']}');
  late final _promo = TextEditingController(text: _c?.offer['promo'] == null ? '' : '${_c!.offer['promo']}');
  late String _currency = J.s(_c?.offer['currency'] ?? 'CAD');

  // The form, the design, the rest.
  late List<FormQuestion> _questions = (_c?.formFields ?? <Map<String, dynamic>>[]).map(FormQuestion.from).toList();
  late Map<String, dynamic> _design = designCopy(_c?.raw['design'], widget.meta);
  late String _goal = _c?.goal ?? 'group';
  late String _mode = _c?.languageMode ?? 'auto';
  late String _defaultLang = _c?.defaultLang ?? 'fr';
  late int? _promotion = _c?.promotionId;
  late String? _image = _c?.imageKey;
  late final Map<String, dynamic> _audience = _c?.audience ?? blankAudience();
  late List<String> _excluded = _c?.excluded ?? [];
  String? _lang;
  bool _saving = false;
  bool _opening = false;
  String? _error;

  // The audience, counted by the server shortly after each change.
  Map<String, dynamic>? _counts;
  List<Map<String, dynamic>> _people = [];
  bool _counting = false;
  Timer? _countTimer;
  int _countTicket = 0;

  // The AI.
  final _brief = TextEditingController();
  late bool _withDesign = _c == null;
  bool _writing = false;
  bool _drawing = false;
  String? _aiError;
  Map<String, dynamic>? _aiResult;
  Map<String, dynamic>? _beforeAi;

  // The model to write with (Vertex): the administrator's pick, and what each model did lately.
  bool get _vertex => J.map(widget.meta['ai'])['engine'] == 'vertex';
  late List<Map<String, dynamic>> _choices = modelChoices(J.map(widget.meta['ai'])['writing_choices']);
  late String? _model = _vertex && _choices.isNotEmpty ? J.s(_choices.first['id']) : null;
  bool _checking = false;

  // The picture asked with the email, and the one it has.
  bool _withPicture = false;
  final _picturePrompt = TextEditingController();
  String _place = 'top';
  String _imagePrompt = '';
  Map<String, dynamic>? _picture;
  String? _pictureError;

  String _initial(String key, String lang) {
    final w = _c?.words(lang);
    if (w == null) return '';
    final v = w[key];
    return v is List ? v.join('\n') : J.s(v);
  }

  List<TextEditingController> get _own => [..._t.values, _name, _url1, _url2, _regular, _promo];

  @override
  void initState() {
    super.initState();
    for (final c in _own) {
      c.addListener(_changed);
    }
    for (final q in _questions) {
      _listen(q);
    }
    _brief.addListener(_changed);
    _count();
  }

  void _listen(FormQuestion q) {
    for (final c in q.controllers) {
      c.addListener(_changed);
    }
  }

  void _changed() {
    if (mounted) setState(() {});
  }

  @override
  void dispose() {
    _countTimer?.cancel();
    for (final c in [..._own, _brief, _picturePrompt]) {
      c.dispose();
    }
    for (final q in _questions) {
      q.dispose();
    }
    super.dispose();
  }

  String? _text(TextEditingController c) => c.text.trim().isEmpty ? null : c.text.trim();
  Map<String, dynamic> get _settings => J.map(widget.meta['settings']);
  Map<String, dynamic> get _sources => J.map(widget.meta['sources']);
  bool get _usesForm => _primary == 'form' || _secondary == 'form';

  Map<String, dynamic> _button(String action, TextEditingController url) => {
    'action': action,
    'url': action == 'link' || action == 'whatsapp' ? _text(url) : null,
  };

  /// The email as the API takes it.
  Map<String, dynamic> _body() => {
    'name': _text(_name),
    'goal': _goal,
    'language_mode': _mode,
    'default_lang': _defaultLang,
    'content': {
      for (final l in ['fr', 'en'])
        l: {
          for (final k in emailWordKeys) k: _text(_t['${k}_$l']!),
          for (final k in emailListKeys)
            k: _t['${k}_$l']!.text.split('\n').map((e) => e.trim()).where((e) => e.isNotEmpty).take(emailListMax[k] ?? 5).toList(),
        },
    },
    'buttons': {'primary': _button(_primary, _url1), 'secondary': _button(_secondary, _url2)},
    'offer': {'show': _offerShow, 'regular': num.tryParse(_regular.text.trim().replaceAll(',', '.')), 'promo': num.tryParse(_promo.text.trim().replaceAll(',', '.')), 'currency': _currency},
    'design': _design,
    'form': {'fields': _questions.map((q) => q.toJson()).toList()},
    'image_key': _image,
    'promotion_id': _promotion,
    'audience': _audience,
    'excluded': _excluded,
  };

  // ── Buttons and form ──

  void _setAction(String which, String action) {
    setState(() {
      if (which == 'primary') {
        _primary = action;
      } else {
        _secondary = action;
      }
      // A form button gets the usual questions to start with.
      if (action == 'form' && _questions.isEmpty) {
        _questions = defaultFormFields().map(FormQuestion.from).toList();
        _questions.forEach(_listen);
      }
    });
  }

  void _setQuestions(List<FormQuestion> next) {
    final keep = next.toSet();
    for (final q in _questions) {
      if (!keep.contains(q)) q.dispose();
    }
    for (final q in next) {
      if (!_questions.contains(q)) _listen(q);
    }
    setState(() => _questions = next);
  }

  // ── Audience ──

  void _setAudience(void Function(Map<String, dynamic> a) change) {
    setState(() => change(_audience));
    _count();
  }

  void _count() {
    _countTimer?.cancel();
    final sources = (_audience['sources'] as List);
    if (sources.isEmpty) {
      setState(() {
        _counts = null;
        _people = [];
        _counting = false;
      });
      return;
    }
    setState(() => _counting = true);
    final ticket = ++_countTicket;
    _countTimer = Timer(const Duration(milliseconds: 350), () async {
      try {
        final res = await ref.read(apiClientProvider).post('/admin/email-campaigns/audience', data: {'audience': _audience, 'excluded': <String>[]});
        if (!mounted || ticket != _countTicket) return;
        final data = J.map(res.data);
        setState(() {
          _counts = J.map(data['counts']);
          _people = J.list(data, ['people']);
          _counting = false;
        });
      } catch (e) {
        if (!mounted || ticket != _countTicket) return;
        setState(() {
          _counting = false;
          _error = apiErrorText(context, e);
        });
      }
    });
  }

  List<Map<String, dynamic>> get _kept => _people.where((p) => !_excluded.contains(J.s(p['email']))).toList();

  Future<void> _showPeople() async {
    await showAdminPanel(
      context,
      tabletWidth: 560,
      builder: (_) => _PeoplePanel(people: _people, excluded: _excluded, onChanged: (e) => setState(() => _excluded = e)),
    );
  }

  // ── AI ──

  /// A link the buttons cannot use, said before anything is asked or saved.
  String? _linkProblem(bool fr) {
    for (final (action, url, which) in [(_primary, _url1.text.trim(), fr ? 'du bouton principal' : 'main button'), (_secondary, _url2.text.trim(), fr ? 'du deuxième bouton' : 'second button')]) {
      if (url.isEmpty) continue;
      if (action == 'link' && !isHttpsLink(url)) return fr ? 'Le lien $which commence par https://.' : 'The $which link must start with https://.';
      if (action == 'whatsapp' && !isWhatsAppInvite(url)) {
        return fr ? 'Collez le lien d’invitation du groupe WhatsApp (https://chat.whatsapp.com/…).' : 'Paste the WhatsApp group’s invitation link (https://chat.whatsapp.com/…).';
      }
    }
    return null;
  }

  Future<void> _write() async {
    final fr = context.isFrench;
    final problem = _linkProblem(fr);
    if (problem != null) {
      setState(() => _aiError = problem);
      return;
    }
    setState(() {
      _writing = true;
      _aiError = null;
      _aiResult = null;
      _picture = null;
      _pictureError = null;
    });
    Map<String, dynamic>? draft;
    try {
      final body = _body();
      final res = await ref.read(apiClientProvider).post(
        '/admin/email-campaigns/ai/draft',
        data: {
          'brief': _brief.text,
          'goal': _goal,
          'promotion_id': _promotion,
          'primary': (body['buttons'] as Map)['primary'],
          'secondary': (body['buttons'] as Map)['secondary'],
          'current': body,
          'timezone': aiTimeZone(ref),
          'notes_lang': fr ? 'fr' : 'en',
          'model': _model,
          'picture': _withPicture,
          'picture_prompt': _withPicture && _picturePrompt.text.trim().isNotEmpty ? _picturePrompt.text.trim() : null,
        },
        options: _aiOptions,
      );
      if (!mounted) return;
      draft = J.map(res.data);
      _beforeAi ??= body;
      _apply(J.map(draft['fields']), design: _withDesign);
      setState(() {
        _aiResult = draft;
        final updated = modelChoices(draft!['choices']);
        if (updated.isNotEmpty) _choices = updated;
      });
    } catch (e) {
      if (mounted) setState(() => _aiError = apiErrorText(context, e));
    } finally {
      if (mounted) setState(() => _writing = false);
    }
    if (draft != null && _withPicture && mounted) await _drawPicture(draft);
  }

  /// The picture asked with the email, by the marketing painter, from the description the writer refined.
  Future<void> _drawPicture(Map<String, dynamic> draft) async {
    final scene = J.s(draft['image_prompt']).trim().isNotEmpty ? J.s(draft['image_prompt']).trim() : _picturePrompt.text.trim();
    if (scene.length < 12) return;
    setState(() => _drawing = true);
    try {
      final content = J.map(J.map(draft['fields'])['content']);
      final res = await ref.read(apiClientProvider).post(
        '/admin/email-campaigns/ai/image',
        data: {'prompt': scene, 'theme': J.s(_design['theme']), 'title': J.s(J.map(content['en'])['headline']).isNotEmpty ? J.s(J.map(content['en'])['headline']) : J.s(J.map(content['fr'])['headline'])},
        options: _aiOptions,
      );
      if (!mounted) return;
      final p = J.map(res.data);
      setState(() {
        _image = J.s(p['image_key']);
        _imagePrompt = scene;
        _design = placePicture(_design, _place);
        _picture = {...p, 'prompt': scene};
      });
    } catch (e) {
      if (mounted) setState(() => _pictureError = apiErrorText(context, e));
    } finally {
      if (mounted) setState(() => _drawing = false);
    }
  }

  /// One short call to each model, to see which ones answer on this project.
  Future<void> _checkModels() async {
    setState(() => _checking = true);
    try {
      final res = await ref.read(apiClientProvider).post('/admin/email-campaigns/ai/models/check', options: _aiOptions);
      final updated = modelChoices(J.map(res.data)['choices']);
      if (mounted && updated.isNotEmpty) setState(() => _choices = updated);
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _checking = false);
    }
  }

  /// Fills the editor with an email as the API gives it (the AI's draft, or the state before it).
  void _apply(Map<String, dynamic> f, {bool design = true}) {
    final content = J.map(f['content']);
    for (final l in ['fr', 'en']) {
      if (!content.containsKey(l)) continue;
      final w = wordsCopy(content[l]);
      for (final k in _textKeys) {
        final v = w[k];
        _t['${k}_$l']!.text = v is List ? v.join('\n') : J.s(v);
      }
    }
    if (f['buttons'] != null) {
      final b = J.map(f['buttons']);
      final p = buttonCopy(b['primary']);
      final s = buttonCopy(b['secondary'], secondary: true);
      _primary = J.s(p['action']);
      _secondary = J.s(s['action']);
      _url1.text = J.s(p['url']);
      _url2.text = J.s(s['url']);
    }
    if (f['offer'] != null) {
      final o = offerCopy(f['offer']);
      _offerShow = o['show'] == true;
      _regular.text = o['regular'] == null ? '' : '${o['regular']}';
      _promo.text = o['promo'] == null ? '' : '${o['promo']}';
      _currency = J.s(o['currency']);
    }
    if (f['form'] != null) _setQuestions(formFieldsOf(f['form']).map(FormQuestion.from).toList());
    if (J.s(f['name']).isNotEmpty && _name.text.trim().isEmpty) _name.text = J.s(f['name']);
    setState(() {
      if (design && J.map(f['design']).isNotEmpty) _design = designCopy(f['design']);
      if (emailGoals.contains(f['goal'])) _goal = '${f['goal']}';
      if (f.containsKey('promotion_id')) _promotion = f['promotion_id'] == null ? null : J.i(f['promotion_id']);
      _error = null;
    });
  }

  void _undoAi() {
    final before = _beforeAi;
    if (before == null) return;
    _apply(before);
    setState(() {
      _beforeAi = null;
      _aiResult = null;
    });
  }

  // ── Save and preview ──

  Future<int?> _persist() async {
    final api = ref.read(apiClientProvider);
    if (_id != null) {
      await api.put('/admin/email-campaigns/$_id', data: _body());
      return _id;
    }
    final res = await api.post('/admin/email-campaigns', data: _body());
    final id = J.i(J.map(J.map(res.data)['campaign'])['id']);
    setState(() => _id = id);
    return id;
  }

  /// What stops the email from being saved (the server says the same).
  String? _check(bool fr) {
    if (_text(_t['subject_fr']!) == null && _text(_t['subject_en']!) == null) {
      return fr ? 'Écrivez un objet, en français ou en anglais (ou laissez l’IA l’écrire).' : 'Write a subject, in French or English (or let the AI write it).';
    }
    final link = _linkProblem(fr);
    if (link != null) return link;
    if (_usesForm) {
      if (!_questions.any((q) => q.type == 'email')) return fr ? 'Le formulaire a besoin d’une question « Email ».' : 'The form needs an « Email » question.';
      for (final q in _questions) {
        final j = q.toJson();
        if (j['label_fr'] == null && j['label_en'] == null) return fr ? 'Chaque question du formulaire a besoin d’un intitulé.' : 'Every question of the form needs words.';
        if (q.hasChoices && (j['options_fr'] as List).isEmpty && (j['options_en'] as List).isEmpty) {
          return fr ? 'La question « ${fieldLabel(j, fr)} » a besoin de choix.' : 'The question « ${fieldLabel(j, fr)} » needs choices.';
        }
      }
    }
    return null;
  }

  Future<void> _save() async {
    final fr = context.isFrench;
    final problem = _check(fr);
    setState(() => _error = problem);
    if (problem != null) return;
    setState(() => _saving = true);
    try {
      final id = await _persist();
      if (!mounted) return;
      adminToast(context, fr ? 'Email enregistré' : 'Email saved');
      Navigator.of(context).pop(id);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = apiErrorText(context, e);
        _saving = false;
      });
    }
  }

  /// The real email, in the phone's browser: saved first, then a 30-minute link.
  Future<void> _preview(String lang) async {
    final fr = context.isFrench;
    final problem = _check(fr);
    setState(() => _error = problem);
    if (problem != null) return;
    setState(() => _opening = true);
    try {
      final id = await _persist();
      final res = await ref.read(apiClientProvider).post('/admin/email-campaigns/$id/preview-link', data: {'lang': _mode == 'both' ? 'both' : lang});
      final uri = Uri.tryParse(J.s(J.map(res.data)['url']));
      if (uri == null) return;
      if (!await launchUrl(uri, mode: LaunchMode.inAppBrowserView) && mounted) {
        adminToast(context, fr ? 'Impossible d’ouvrir l’aperçu.' : 'The preview could not be opened.', error: true);
      }
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _opening = false);
    }
  }

  // ── Build ──

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final lang = _lang ?? (_mode == 'en' || (_mode == 'auto' && _defaultLang == 'en') ? 'en' : 'fr');
    final other = lang == 'fr' ? 'en' : 'fr';
    final missing = emailMissing(_body(), fr, postalAddress: J.s(_settings['postal_address']), recipients: _counts == null ? null : _kept.length);
    final aiAvailable = J.map(widget.meta['ai'])['available'] == true;
    final sender = J.s(_settings['sender_name']).isNotEmpty ? J.s(_settings['sender_name']) : J.s(J.map(widget.meta['sender'])['name']);
    TextEditingController t(String k, [String? l]) => _t['${k}_${l ?? lang}']!;
    String hintOf(String k) => t(k, other).text;
    final subjectLength = t('subject').text.trim().length;

    final langSwitch = SegmentedButton<String>(
      segments: [
        for (final l in ['fr', 'en'])
          ButtonSegment(value: l, label: Text(_text(t('subject', l)) != null && _text(t('body', l)) != null ? '${l.toUpperCase()} ✓' : l.toUpperCase())),
      ],
      selected: {lang},
      showSelectedIcon: false,
      style: const ButtonStyle(visualDensity: VisualDensity.compact, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
      onSelectionChanged: (s) => setState(() => _lang = s.first),
    );

    return AdminPanel(
      title: _c == null ? (fr ? 'Nouvel email' : 'New email') : (fr ? 'Modifier l’email' : 'Edit the email'),
      subtitle: missing.isEmpty
          ? (fr ? 'Prêt : enregistrez, envoyez-vous un test, puis envoyez-le.' : 'Ready: save, send yourself a test, then send it.')
          : (fr ? 'Avant l’envoi : ${missing.join(', ')}.' : 'Before sending: ${missing.join(', ')}.'),
      actions: [
        AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: _saving ? null : () => Navigator.of(context).pop()),
        AdminButton(
          _c == null ? (fr ? 'Enregistrer' : 'Save draft') : (fr ? 'Enregistrer' : 'Save'),
          key: const Key('email-save'),
          icon: Icons.check,
          busy: _saving,
          onPressed: _saving ? null : _save,
        ),
      ],
      children: [
        if (_error != null) MarketingBanner(icon: Icons.error_outline, color: AppColors.bad, title: fr ? 'À corriger' : 'To fix', text: _error!),
        _aiCard(fr, aiAvailable),

        PanelSection(fr ? '1 · Qui le reçoit' : '1 · Who receives it'),
        _audienceSection(fr),

        PanelSection(fr ? '2 · Ce qu’il dit' : '2 · What it says', trailing: langSwitch),
        _Inbox(sender: sender, subject: t('subject').text, preheader: t('preheader').text, fr: fr, color: designColor(_design, 'primary')),
        const SizedBox(height: 12),
        AdminField(
          key: Key('email-subject-$lang'),
          label: fr ? 'Objet${subjectLength > 0 ? ' · $subjectLength car.' : ' (40 à 55 caractères)'}' : 'Subject${subjectLength > 0 ? ' · $subjectLength chars' : ' (40 to 55 characters)'}',
          controller: t('subject'),
          hint: hintOf('subject'),
        ),
        AdminField(label: fr ? 'Texte d’aperçu (après l’objet)' : 'Preview text (after the subject)', controller: t('preheader'), hint: hintOf('preheader')),
        AdminField(label: fr ? 'Surtitre (facultatif)' : 'Small title (optional)', controller: t('eyebrow'), hint: hintOf('eyebrow').isEmpty ? (fr ? 'ex. Nouveau groupe' : 'e.g. New group') : hintOf('eyebrow')),
        AdminField(label: fr ? 'Titre' : 'Headline', controller: t('headline'), hint: hintOf('headline')),
        AdminField(key: Key('email-body-$lang'), label: fr ? 'Message' : 'Message', controller: t('body'), maxLines: 8, hint: lang == 'fr' ? 'Bonjour {first_name},\n\n…' : 'Hi {first_name},\n\n…'),
        _Hint(fr
            ? '{first_name} devient le prénom de chaque personne. Une ligne vide commence un paragraphe, « - » une liste, **gras**.'
            : '{first_name} becomes each person’s first name. An empty line starts a paragraph, « - » a list, **bold**.'),
        const SizedBox(height: 8),
        AdminField(label: fr ? 'Titre des points clés (facultatif)' : 'Key points title (optional)', controller: t('highlights_title'), hint: fr ? 'ex. Ce qui vous attend' : 'e.g. What you get'),
        AdminField(label: fr ? 'Points clés (un par ligne, 5 au plus)' : 'Key points (one per line, up to 5)', controller: t('highlights'), maxLines: 4),
        AdminField(label: fr ? 'Titre des étapes (facultatif)' : 'Steps title (optional)', controller: t('steps_title'), hint: fr ? 'ex. Comment ça marche' : 'e.g. How it works'),
        AdminField(label: fr ? 'Étapes (une par ligne, 4 au plus)' : 'Steps (one per line, up to 4)', controller: t('steps'), maxLines: 3),
        _offerSection(fr, lang),
        AdminField(label: fr ? 'Signature' : 'Signature', controller: t('signature'), hint: lang == 'fr' ? 'L’équipe Learn French with Natives' : 'The Learn French with Natives team'),
        AdminField(label: fr ? 'P.-S. (facultatif)' : 'P.S. (optional)', controller: t('ps')),
        _previewRow(fr),

        PanelSection(_usesForm ? (fr ? '3 · Boutons et formulaire' : '3 · Buttons and form') : (fr ? '3 · Boutons' : '3 · Buttons')),
        _buttonEditor(fr, 'primary', lang),
        const SizedBox(height: 10),
        _buttonEditor(fr, 'secondary', lang),
        if (_usesForm) ...[
          PanelSection(fr ? 'Le formulaire' : 'The form', trailing: langSwitch),
          _Hint(fr
              ? 'Il s’ouvre sur le site, déjà rempli avec le nom et l’email de la personne. Les réponses arrivent dans l’onglet « Réponses » de l’email, avec une notification.'
              : 'It opens on the website, already filled with the person’s name and email. Answers arrive in the email’s « Answers » section, with a notification.'),
          const SizedBox(height: 8),
          AdminField(key: Key('email-form-title-$lang'), label: fr ? 'Titre du formulaire' : 'Form title', controller: t('form_title'), hint: lang == 'fr' ? 'Réservez votre place' : 'Book your seat'),
          AdminField(label: fr ? 'Quelques mots avant les questions' : 'A few words above the questions', controller: t('form_intro'), maxLines: 3),
          AdminField(label: fr ? 'Bouton d’envoi' : 'Send button', controller: t('form_submit'), hint: lang == 'fr' ? 'Envoyer mes réponses' : 'Send my answers'),
          AdminField(label: fr ? 'Titre du remerciement' : 'Thank-you title', controller: t('form_thanks_title'), hint: lang == 'fr' ? 'Merci !' : 'Thank you!'),
          AdminField(label: fr ? 'Message de remerciement' : 'Thank-you message', controller: t('form_thanks_text'), maxLines: 2, hint: lang == 'fr' ? 'Nous vous répondons rapidement.' : 'We will get back to you soon.'),
          EmailFormBuilder(
            questions: _questions,
            onChanged: () => setState(() {}),
            onAdd: (q) => _setQuestions([..._questions, q]),
            onRemove: (q) => _setQuestions(_questions.where((x) => x != q).toList()),
          ),
        ],

        PanelSection(fr ? '4 · Design' : '4 · Design'),
        EmailDesignSection(
          design: _design,
          meta: widget.meta,
          email: _body,
          model: _model,
          onChoices: (c) => setState(() => _choices = c),
          onDesign: (d) => setState(() => _design = d),
        ),
        PanelSection(fr ? 'Image (facultative)' : 'Picture (optional)'),
        EmailPictureSection(
          imageKey: _image,
          design: _design,
          meta: widget.meta,
          title: _text(_t['headline_en']!) ?? _text(_t['headline_fr']!),
          prompt: _imagePrompt,
          onPicture: (key, prompt) => setState(() {
            _image = key;
            _imagePrompt = prompt;
          }),
          onPlace: (place) => setState(() => _design = placePicture(_design, place)),
        ),
        const SizedBox(height: 6),
        _previewRow(fr),

        PanelSection(fr ? '5 · Langue et nom' : '5 · Language and name'),
        AdminSelect<String>(
          key: const Key('email-language'),
          label: fr ? 'Langue' : 'Language',
          value: _mode,
          options: [for (final m in emailLanguageModes) FilterOption(m, languageModeLabel(m, fr))],
          onChanged: (v) => setState(() {
            _mode = v ?? 'auto';
            _lang = null;
          }),
        ),
        if (_mode == 'auto')
          AdminSelect<String>(
            label: fr ? 'Langue principale (langue inconnue)' : 'Main language (unknown language)',
            value: _defaultLang,
            options: [FilterOption('fr', fr ? 'Français' : 'French'), FilterOption('en', fr ? 'Anglais' : 'English')],
            onChanged: (v) => setState(() => _defaultLang = v ?? 'fr'),
          ),
        AdminField(label: fr ? 'Nom de l’email (vous seul le voyez)' : 'Name of this email (only you see it)', controller: _name),
      ],
    );
  }

  Widget _previewRow(bool fr) => Padding(
    padding: const EdgeInsets.only(top: 4),
    child: Wrap(
      spacing: 8,
      runSpacing: 8,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        for (final l in (_mode == 'both' ? ['both'] : ['fr', 'en']))
          AdminButton(
            l == 'both' ? (fr ? 'Voir l’email' : 'See the email') : (fr ? 'Voir l’email ${l.toUpperCase()}' : 'See the ${l.toUpperCase()} email'),
            key: Key('email-preview-$l'),
            icon: Icons.visibility_outlined,
            primary: false,
            busy: _opening,
            onPressed: _opening ? null : () => _preview(l),
          ),
      ],
    ),
  );

  /// One button: what it opens (a page, the form, WhatsApp), its words in both languages, its link.
  Widget _buttonEditor(bool fr, String which, String lang) {
    final primary = which == 'primary';
    final action = primary ? _primary : _secondary;
    final url = primary ? _url1 : _url2;
    final labelKey = primary ? 'primary_label' : 'secondary_label';
    final pages = J.map(widget.meta['site_pages']);
    final quick = <(String, String)>[
      ('trial_class', fr ? 'Cours d’essai' : 'Trial class'),
      ('offers', fr ? 'Offres' : 'Offers'),
      ('free_courses', fr ? 'Cours gratuits' : 'Free courses'),
      ('level_test', fr ? 'Test de niveau' : 'Level test'),
    ];
    final hint = switch (action) {
      'form' => lang == 'fr' ? 'Je réponds' : 'Reply now',
      'whatsapp' => lang == 'fr' ? 'Rejoindre le groupe WhatsApp' : 'Join the WhatsApp group',
      _ => lang == 'fr' ? 'Réserver ma place' : 'Book my seat',
    };
    return Container(
      key: Key('email-button-$which'),
      padding: const EdgeInsets.fromLTRB(12, 10, 12, 0),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: primary ? AppColors.adminAccent.withValues(alpha: 0.4) : AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(primary ? (fr ? 'Bouton principal' : 'Main button') : (fr ? 'Deuxième bouton' : 'Second button'), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
          const SizedBox(height: 6),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              for (final a in [if (!primary) 'none', ...emailActions])
                ChoiceChip(
                  key: Key('email-$which-action-$a'),
                  avatar: Icon(actionIcon(a), size: 16),
                  label: Text(actionLabel(a, fr)),
                  selected: action == a,
                  visualDensity: VisualDensity.compact,
                  onSelected: (_) => _setAction(which, a),
                ),
            ],
          ),
          const SizedBox(height: 10),
          if (action != 'none') ...[
            AdminField(key: Key('email-$which-label-$lang'), label: fr ? 'Texte du bouton (${lang.toUpperCase()})' : 'Button words (${lang.toUpperCase()})', controller: _t['${labelKey}_$lang']!, hint: hint),
            if (action == 'link') ...[
              AdminField(key: Key('email-$which-url'), label: fr ? 'Lien (https://…)' : 'Link (https://…)', controller: url, keyboardType: TextInputType.url),
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    for (final (k, label) in quick)
                      if (J.s(J.map(pages[k])[lang]).isNotEmpty)
                        ActionChip(label: Text(label), visualDensity: VisualDensity.compact, onPressed: () => url.text = J.s(J.map(pages[k])[lang])),
                  ],
                ),
              ),
            ],
            if (action == 'whatsapp') ...[
              AdminField(key: Key('email-$which-whatsapp'), label: fr ? 'Lien d’invitation du groupe' : 'Group invitation link', controller: url, keyboardType: TextInputType.url, hint: 'https://chat.whatsapp.com/…'),
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _Hint(fr ? 'WhatsApp → le groupe → Inviter via un lien → copier le lien.' : 'WhatsApp → the group → Invite via link → copy the link.'),
              ),
            ],
            if (action == 'form')
              Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: _Hint(fr ? 'Ouvre le formulaire ci-dessous ; vous recevez les réponses.' : 'Opens the form below; you receive the answers.'),
              ),
          ],
        ],
      ),
    );
  }

  Widget _offerSection(bool fr, String lang) => Container(
    margin: const EdgeInsets.only(bottom: 14),
    padding: const EdgeInsets.fromLTRB(12, 4, 12, 0),
    decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SwitchListTile.adaptive(
          key: const Key('email-offer-show'),
          contentPadding: EdgeInsets.zero,
          value: _offerShow,
          activeTrackColor: AppColors.adminAccent,
          title: Text(fr ? 'Encadré prix' : 'Price box', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
          subtitle: Text(fr ? 'Le prix, l’ancien barré, la date limite' : 'The price, the old one crossed out, the deadline', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
          onChanged: (v) => setState(() => _offerShow = v),
        ),
        if (_offerShow) ...[
          Row(
            children: [
              Expanded(child: AdminField(label: fr ? 'Prix normal' : 'Regular price', controller: _regular, keyboardType: const TextInputType.numberWithOptions(decimal: true))),
              const SizedBox(width: 8),
              Expanded(child: AdminField(label: fr ? 'Prix de l’offre' : 'Offer price', controller: _promo, keyboardType: const TextInputType.numberWithOptions(decimal: true))),
            ],
          ),
          Wrap(
            spacing: 6,
            children: [
              for (final cur in ['CAD', 'USD', 'EUR'])
                ChoiceChip(label: Text(cur), selected: _currency == cur, visualDensity: VisualDensity.compact, onSelected: (_) => setState(() => _currency = cur)),
            ],
          ),
          const SizedBox(height: 10),
          AdminField(label: fr ? 'Étiquette (${lang.toUpperCase()})' : 'Label (${lang.toUpperCase()})', controller: _t['offer_label_$lang']!, hint: lang == 'fr' ? 'Prix de lancement' : 'Launch price'),
          AdminField(label: fr ? 'Précision (${lang.toUpperCase()})' : 'Note (${lang.toUpperCase()})', controller: _t['offer_note_$lang']!, hint: lang == 'fr' ? 'pour 12 semaines' : 'for 12 weeks'),
          AdminField(label: fr ? 'Date limite (${lang.toUpperCase()})' : 'Deadline (${lang.toUpperCase()})', controller: _t['deadline_$lang']!, hint: lang == 'fr' ? 'Jusqu’au 15 décembre' : 'Until December 15'),
        ],
      ],
    ),
  );

  Widget _aiCard(bool fr, bool available) {
    final result = _aiResult;
    final ideas = result == null ? <String>[] : [for (final l in ['fr', 'en']) ...((J.map(result['subject_ideas'])[l] as List?) ?? []).map((s) => '$l|$s')];
    final notes = result == null ? <String>[] : ((result['notes'] as List?) ?? []).map((n) => '$n').toList();
    final promotions = J.list(widget.meta, ['promotions']);
    final hasContent = ['fr', 'en'].any((l) => _text(_t['subject_$l']!) != null || _text(_t['body_$l']!) != null);
    return AdminCard(
      title: hasContent ? (fr ? 'Modifier l’email avec l’IA' : 'Change the email with AI') : (fr ? 'Écrire l’email avec l’IA' : 'Write the email with AI'),
      icon: Icons.auto_awesome,
      accent: const Color(0xFF6D4AFF),
      child: !available
          ? Text(
              fr ? 'Le moteur d’IA n’est pas configuré sur le serveur (Admin → Moteur d’IA).' : 'The AI engine is not configured on the server (Admin → AI engine).',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
            )
          : Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                if (_vertex && _choices.isNotEmpty) ...[
                  Row(
                    children: [
                      Expanded(
                        child: Text(fr ? 'Modèle d’IA (Vertex AI)' : 'AI model (Vertex AI)', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.textMuted)),
                      ),
                      TextButton(
                        key: const Key('email-ai-check-models'),
                        onPressed: _checking || _writing ? null : _checkModels,
                        child: _checking ? const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)) : Text(fr ? 'Vérifier' : 'Check'),
                      ),
                    ],
                  ),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      for (final m in _choices)
                        ChoiceChip(
                          key: Key('email-ai-model-${m['id']}'),
                          avatar: m['state'] == 'ok'
                              ? const Icon(Icons.check_circle, size: 16, color: AppColors.good)
                              : m['state'] == 'missing' || m['state'] == 'error'
                              ? const Icon(Icons.block, size: 16, color: AppColors.warn)
                              : null,
                          label: Text(J.s(m['label'])),
                          tooltip: modelStateLabel(m['state'], fr),
                          selected: _model == m['id'],
                          visualDensity: VisualDensity.compact,
                          onSelected: _writing ? null : (_) => setState(() => _model = J.s(m['id'])),
                        ),
                    ],
                  ),
                  if (_choices.any((m) => m['id'] == _model && m['state'] == 'missing'))
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        fr
                            ? 'Ce modèle n’a pas répondu sur votre projet Vertex (introuvable ou accès non accordé) : le modèle suivant écrira à sa place.'
                            : 'This model did not answer on your Vertex project (not found or no access): the next model will write instead.',
                        style: AppTypography.caption.copyWith(color: AppColors.warn),
                      ),
                    ),
                  const SizedBox(height: 12),
                ],
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    for (final g in emailGoals)
                      ChoiceChip(
                        key: Key('email-goal-$g'),
                        label: Text(goalLabel(g, fr)),
                        selected: _goal == g,
                        onSelected: _writing ? null : (_) => setState(() => _goal = g),
                        visualDensity: VisualDensity.compact,
                      ),
                  ],
                ),
                const SizedBox(height: 10),
                TextField(
                  key: const Key('email-ai-brief'),
                  controller: _brief,
                  enabled: !_writing,
                  maxLines: 5,
                  minLines: 3,
                  style: AppTypography.bodyMedium,
                  decoration: adminInputDecoration(
                    hasContent
                        ? (fr ? 'Que faut-il changer ?' : 'What should change?')
                        : (fr ? 'De quoi parle l’email, et que doivent faire les gens ?' : 'What is the email about, and what should people do?'),
                    hint: hasContent
                        ? (fr ? 'ex. Plus court ; demander aussi la date d’examen' : 'e.g. Shorter; also ask for their exam date')
                        : (fr ? 'Le cours, les dates, le prix, la date limite… L’IA n’utilise que vos informations.' : 'The class, the dates, the price, the deadline… The AI only uses your facts.'),
                  ),
                ),
                const SizedBox(height: 10),
                Text(fr ? 'Le bouton principal ouvre…' : 'The main button opens…', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.textMuted)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    for (final a in emailActions)
                      ChoiceChip(
                        key: Key('email-ai-primary-$a'),
                        avatar: Icon(actionIcon(a), size: 16),
                        label: Text(actionLabel(a, fr)),
                        selected: _primary == a,
                        visualDensity: VisualDensity.compact,
                        onSelected: _writing ? null : (_) => _setAction('primary', a),
                      ),
                  ],
                ),
                if (_primary == 'whatsapp') ...[
                  const SizedBox(height: 10),
                  AdminField(key: const Key('email-ai-whatsapp'), label: fr ? 'Lien d’invitation du groupe WhatsApp' : 'WhatsApp group invitation link', controller: _url1, keyboardType: TextInputType.url, hint: 'https://chat.whatsapp.com/…'),
                ],
                if (_primary == 'form')
                  Padding(
                    padding: const EdgeInsets.only(top: 6),
                    child: _Hint(fr ? 'L’IA écrit les questions du formulaire : vous pouvez les changer ensuite.' : 'The AI writes the form’s questions: you can change them after.'),
                  ),
                const SizedBox(height: 10),
                Text(fr ? 'Un deuxième bouton ?' : 'A second button?', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.textMuted)),
                const SizedBox(height: 6),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: [
                    for (final a in ['none', ...emailActions])
                      ChoiceChip(
                        key: Key('email-ai-secondary-$a'),
                        label: Text(actionLabel(a, fr)),
                        selected: _secondary == a,
                        visualDensity: VisualDensity.compact,
                        onSelected: _writing ? null : (_) => _setAction('secondary', a),
                      ),
                  ],
                ),
                const SizedBox(height: 12),
                if (promotions.isNotEmpty)
                  AdminSelect<int>(
                    key: ValueKey('email-ai-promotion-$_promotion'),
                    label: fr ? 'Promouvoir une campagne marketing (facultatif)' : 'Promote a marketing campaign (optional)',
                    value: _promotion ?? 0,
                    options: [
                      FilterOption(0, fr ? 'Aucune' : 'None'),
                      for (final p in promotions) FilterOption(J.i(p['id']), J.s(p[fr ? 'title_fr' : 'title_en']).isNotEmpty ? J.s(p[fr ? 'title_fr' : 'title_en']) : J.s(p['slug'])),
                    ],
                    onChanged: (v) => setState(() => _promotion = (v == null || v == 0) ? null : v),
                  ),
                Container(
                  padding: const EdgeInsets.fromLTRB(10, 0, 10, 8),
                  margin: const EdgeInsets.only(bottom: 6),
                  decoration: BoxDecoration(
                    color: _withPicture ? const Color(0xFFFAF5FF) : AppColors.pureWhite,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFDDD6FE)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      SwitchListTile.adaptive(
                        key: const Key('email-ai-picture'),
                        contentPadding: EdgeInsets.zero,
                        dense: true,
                        value: _withPicture,
                        activeTrackColor: const Color(0xFF6D4AFF),
                        title: Text(fr ? 'Ajouter une image' : 'Add a picture', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                        subtitle: Text(
                          fr
                              ? 'Faite par ${J.s(J.map(widget.meta['ai'])['image_model']).isEmpty ? 'le peintre du marketing' : J.s(J.map(widget.meta['ai'])['image_model'])}, comme pour le marketing'
                              : 'Made by ${J.s(J.map(widget.meta['ai'])['image_model']).isEmpty ? 'the marketing painter' : J.s(J.map(widget.meta['ai'])['image_model'])}, like marketing',
                          style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                        ),
                        onChanged: _writing || _drawing ? null : (v) => setState(() => _withPicture = v),
                      ),
                      if (_withPicture) ...[
                        TextField(
                          key: const Key('email-ai-picture-prompt'),
                          controller: _picturePrompt,
                          enabled: !_writing,
                          minLines: 2,
                          maxLines: 4,
                          style: AppTypography.bodyMedium,
                          decoration: adminInputDecoration(
                            fr ? 'Décrivez l’image (facultatif)' : 'Describe the picture (optional)',
                            hint: fr ? 'Qui, où, en train de faire quoi. Vide : l’IA en imagine une qui va avec l’email.' : 'Who, where, doing what. Empty: the AI imagines one that fits the email.',
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 6,
                          runSpacing: 6,
                          children: [
                            for (final (p, label) in [('top', fr ? 'En haut, en grand' : 'At the top, large'), ('inline', fr ? 'Sous le titre' : 'Under the headline')])
                              ChoiceChip(
                                key: Key('email-ai-picture-place-$p'),
                                label: Text(label),
                                selected: _place == p,
                                visualDensity: VisualDensity.compact,
                                onSelected: _writing ? null : (_) => setState(() => _place = p),
                              ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                SwitchListTile.adaptive(
                  key: const Key('email-ai-with-design'),
                  contentPadding: EdgeInsets.zero,
                  dense: true,
                  value: _withDesign,
                  activeTrackColor: const Color(0xFF6D4AFF),
                  title: Text(fr ? 'Appliquer la mise en page qu’elle choisit' : 'Apply the layout it chooses', style: AppTypography.bodySmall),
                  onChanged: _writing ? null : (v) => setState(() => _withDesign = v),
                ),
                Row(
                  children: [
                    if (_beforeAi != null && !_writing)
                      TextButton.icon(onPressed: _undoAi, icon: const Icon(Icons.undo, size: 18), label: Text(fr ? 'Annuler' : 'Undo')),
                    // The button keeps to the room there is (its words shorten on a small phone).
                    Expanded(
                      child: Align(
                        alignment: Alignment.centerRight,
                        child: FilledButton.icon(
                          key: const Key('email-ai-go'),
                          onPressed: _writing || _drawing || _brief.text.trim().length < 8 ? null : _write,
                          style: FilledButton.styleFrom(backgroundColor: const Color(0xFF6D4AFF)),
                          icon: _writing || _drawing
                              ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const AiMark(size: 18),
                          label: Text(
                            _drawing
                                ? (fr ? 'L’image… (environ 15 s)' : 'The picture… (about 15 s)')
                                : _writing
                                ? (fr ? 'L’IA écrit… (jusqu’à 1 min)' : 'Writing… (up to a minute)')
                                : hasContent
                                ? (fr ? 'Appliquer' : 'Apply')
                                : (fr ? 'Écrire l’email' : 'Write the email'),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
                if (_aiError != null) Padding(padding: const EdgeInsets.only(top: 8), child: Text(_aiError!, style: AppTypography.caption.copyWith(color: AppColors.bad))),
                if (result != null) ...[
                  const SizedBox(height: 10),
                  Text(
                    fr
                        ? 'Écrit par ${J.s(result['model_label']).isNotEmpty ? J.s(result['model_label']) : J.s(result['model'])} en français et en anglais. Relisez, corrigez si besoin, puis enregistrez.'
                        : 'Written by ${J.s(result['model_label']).isNotEmpty ? J.s(result['model_label']) : J.s(result['model'])} in French and English. Read it, correct what is needed, then save.',
                    style: AppTypography.caption.copyWith(color: AppColors.good, fontWeight: FontWeight.w700),
                  ),
                  if (_picture != null) ...[
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        SizedBox(
                          width: 110,
                          child: ClipRRect(
                            borderRadius: BorderRadius.circular(8),
                            child: CampaignPicture(imageKey: J.s(_picture!['image_key']), theme: themeOf(J.s(_design['theme'])), height: 64),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                fr
                                    ? 'Image ajoutée · ${_place == 'top' ? 'en haut' : 'sous le titre'}'
                                    : 'Picture added · ${_place == 'top' ? 'at the top' : 'under the headline'}',
                                style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink),
                              ),
                              Text(J.s(_picture!['prompt']), maxLines: 3, overflow: TextOverflow.ellipsis, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                            ],
                          ),
                        ),
                      ],
                    ),
                    if (J.s(_picture!['warning']).isNotEmpty) Text(J.s(_picture!['warning']), style: AppTypography.caption.copyWith(color: AppColors.warn)),
                  ],
                  if (_pictureError != null)
                    Padding(
                      padding: const EdgeInsets.only(top: 6),
                      child: Text(
                        fr ? 'L’email est écrit, mais l’image n’a pas pu être faite : $_pictureError' : 'The email is written, but the picture could not be made: $_pictureError',
                        style: AppTypography.caption.copyWith(color: AppColors.warn),
                      ),
                    ),
                  if (ideas.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(fr ? 'Autres objets à essayer' : 'Other subjects to try', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                    const SizedBox(height: 4),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        for (final i in ideas)
                          ActionChip(
                            label: Text('${i.split('|').first.toUpperCase()} · ${i.substring(3)}', overflow: TextOverflow.ellipsis),
                            onPressed: () {
                              final l = i.split('|').first;
                              _t['subject_$l']!.text = i.substring(3);
                              setState(() => _lang = l);
                            },
                          ),
                      ],
                    ),
                  ],
                  if (notes.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Text(fr ? 'À vérifier avant l’envoi' : 'To check before sending', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                    for (final n in notes) Text('• $n', style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.4)),
                  ],
                ],
              ],
            ),
    );
  }

  Widget _audienceSection(bool fr) {
    final sources = (_audience['sources'] as List).cast<String>();
    final students = _audience['students'] as Map<String, dynamic>;
    final demos = _audience['demos'] as Map<String, dynamic>;
    final candidates = _audience['candidates'] as Map<String, dynamic>;
    String countOf(String s) => switch (s) {
      'students' => fr
          ? '${J.i(J.map(_sources['students'])['active'])} actifs · ${J.i(J.map(_sources['students'])['inactive'])} anciens'
          : '${J.i(J.map(_sources['students'])['active'])} active · ${J.i(J.map(_sources['students'])['inactive'])} former',
      'candidates' => '${J.i(J.map(_sources['candidates'])['active'])}',
      'demos' => '${J.i(J.map(_sources['demos'])['total'])}',
      _ => '${J.i(J.map(_sources['registrations'])['total'])}',
    };
    final kept = _kept;
    final by = <String, int>{};
    for (final p in kept) {
      by[J.s(p['source'])] = (by[J.s(p['source'])] ?? 0) + 1;
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        for (final s in emailSources)
          CheckboxListTile(
            key: Key('email-source-$s'),
            contentPadding: EdgeInsets.zero,
            dense: true,
            value: sources.contains(s),
            secondary: Icon(sourceIcon(s), color: AppColors.adminAccent),
            title: Text(sourceLabel(s, fr), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
            subtitle: Text(countOf(s), style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
            onChanged: (on) => _setAudience((a) {
              final list = (a['sources'] as List).cast<String>().toList();
              on == true ? list.add(s) : list.remove(s);
              a['sources'] = list;
            }),
          ),
        if (sources.contains('students'))
          AdminSelect<String>(
            label: fr ? 'Élèves' : 'Students',
            value: J.s(students['state']),
            options: [
              FilterOption('active', fr ? 'Actifs' : 'Active'),
              FilterOption('inactive', fr ? 'Anciens' : 'Former'),
              FilterOption('all', fr ? 'Les deux' : 'Both'),
            ],
            onChanged: (v) => _setAudience((a) => (a['students'] as Map)['state'] = v ?? 'active'),
          ),
        if (sources.contains('candidates'))
          Wrap(
            spacing: 6,
            children: [
              for (final e in emailExams)
                FilterChip(
                  label: Text(examLabel(e)),
                  selected: (candidates['exams'] as List).contains(e),
                  onSelected: (on) => _setAudience((a) {
                    final list = ((a['candidates'] as Map)['exams'] as List).cast<String>().toList();
                    on ? list.add(e) : list.remove(e);
                    (a['candidates'] as Map)['exams'] = list;
                  }),
                ),
            ],
          ),
        if (sources.contains('demos')) ...[
          AdminSelect<int>(
            label: fr ? 'Demandes de cours d’essai' : 'Trial class requests',
            value: demos['since_days'] == null ? 0 : J.i(demos['since_days']),
            options: [
              FilterOption(30, fr ? '30 derniers jours' : 'Last 30 days'),
              FilterOption(90, fr ? '3 derniers mois' : 'Last 3 months'),
              FilterOption(180, fr ? '6 derniers mois' : 'Last 6 months'),
              FilterOption(365, fr ? '12 derniers mois' : 'Last 12 months'),
              FilterOption(0, fr ? 'Toutes' : 'Any time'),
            ],
            onChanged: (v) => _setAudience((a) => (a['demos'] as Map)['since_days'] = (v == null || v == 0) ? null : v),
          ),
          SwitchListTile.adaptive(
            contentPadding: EdgeInsets.zero,
            dense: true,
            value: demos['exclude_students'] != false,
            activeTrackColor: AppColors.adminAccent,
            title: Text(fr ? 'Sans ceux devenus élèves' : 'Leave out those who became students', style: AppTypography.bodySmall),
            onChanged: (v) => _setAudience((a) => (a['demos'] as Map)['exclude_students'] = v),
          ),
          if (demos['since_days'] == null || J.i(demos['since_days']) > 180)
            _Hint(fr
                ? 'Loi canadienne anti-pourriel : une demande d’information permet d’écrire pendant 6 mois. Au-delà, écrivez seulement aux personnes qui ont accepté vos nouvelles.'
                : 'Canada’s anti-spam law: a request for information allows emails for 6 months. Beyond that, write only to people who agreed to receive your news.'),
        ],
        const SizedBox(height: 8),
        Container(
          key: const Key('email-audience-count'),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppColors.adminAccent.withValues(alpha: 0.07), borderRadius: BorderRadius.circular(12)),
          child: sources.isEmpty
              ? Text(fr ? 'Choisissez au moins une liste.' : 'Choose at least one list.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))
              : _counts == null
              ? Row(children: [const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)), const SizedBox(width: 8), Text(fr ? 'Calcul…' : 'Counting…')])
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text('${kept.length}', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w900, color: AppColors.ink)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            fr ? (kept.length <= 1 ? 'personne le recevra' : 'personnes le recevront') : (kept.length == 1 ? 'person will receive it' : 'people will receive it'),
                            style: AppTypography.bodySmall,
                          ),
                        ),
                        if (_counting) const SizedBox(width: 14, height: 14, child: CircularProgressIndicator(strokeWidth: 2)),
                      ],
                    ),
                    Text(
                      [
                        for (final e in by.entries) '${e.value} ${sourceLabel(e.key, fr).toLowerCase()}',
                        if (J.i(_counts!['duplicates']) > 0) fr ? '${J.i(_counts!['duplicates'])} dans deux listes, compté(s) une fois' : '${J.i(_counts!['duplicates'])} in two lists, counted once',
                        if (J.i(_counts!['suppressed']) > 0) fr ? '${J.i(_counts!['suppressed'])} désinscrit(s), écarté(s)' : '${J.i(_counts!['suppressed'])} unsubscribed, left out',
                        if (_people.length != kept.length) fr ? '${_people.length - kept.length} retiré(s) par vous' : '${_people.length - kept.length} removed by you',
                      ].join(' · '),
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                    if (_people.isNotEmpty)
                      Align(
                        alignment: Alignment.centerLeft,
                        child: TextButton(key: const Key('email-see-people'), onPressed: _showPeople, child: Text(fr ? 'Voir la liste' : 'See the list')),
                      ),
                  ],
                ),
        ),
      ],
    );
  }
}

/// The email as a line of the inbox: sender, subject, preview text.
class _Inbox extends StatelessWidget {
  final String sender;
  final String subject;
  final String preheader;
  final bool fr;
  final Color color;
  const _Inbox({required this.sender, required this.subject, required this.preheader, required this.fr, required this.color});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        CircleAvatar(
          radius: 18,
          backgroundColor: color,
          child: Text(sender.isEmpty ? 'L' : sender[0], style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700)),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(sender, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
              Text(
                subject.trim().isEmpty ? (fr ? 'Objet' : 'Subject') : subject,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink),
              ),
              Text(
                preheader.trim().isEmpty ? (fr ? 'Le texte d’aperçu apparaît ici.' : 'The preview text appears here.') : preheader,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class _Hint extends StatelessWidget {
  final String text;
  const _Hint(this.text);

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(top: 4, bottom: 4),
    child: Text(text, style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.4)),
  );
}

/// Everyone the lists select, to remove someone (or put them back).
class _PeoplePanel extends StatefulWidget {
  final List<Map<String, dynamic>> people;
  final List<String> excluded;
  final ValueChanged<List<String>> onChanged;
  const _PeoplePanel({required this.people, required this.excluded, required this.onChanged});

  @override
  State<_PeoplePanel> createState() => _PeoplePanelState();
}

class _PeoplePanelState extends State<_PeoplePanel> {
  late final List<String> _out = [...widget.excluded];
  String _q = '';

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final q = _q.trim().toLowerCase();
    final shown = widget.people.where((p) => q.isEmpty || '${p['email']} ${p['name']}'.toLowerCase().contains(q)).take(300).toList();
    return AdminPanel(
      title: fr ? '${widget.people.length - _out.length} sur ${widget.people.length} le recevront' : '${widget.people.length - _out.length} of ${widget.people.length} will receive it',
      actions: [AdminButton(fr ? 'Terminé' : 'Done', onPressed: () => Navigator.of(context).pop())],
      children: [
        AdminSearchField(hint: fr ? 'Rechercher' : 'Search', onChanged: (v) => setState(() => _q = v)),
        const SizedBox(height: 8),
        for (final p in shown)
          ListTile(
            contentPadding: EdgeInsets.zero,
            dense: true,
            title: Text(
              J.s(p['name']).isEmpty ? J.s(p['email']) : J.s(p['name']),
              style: TextStyle(decoration: _out.contains(J.s(p['email'])) ? TextDecoration.lineThrough : null, fontWeight: FontWeight.w600),
            ),
            subtitle: Text('${J.s(p['email'])} · ${sourceLabel(J.s(p['source']), fr)}', maxLines: 1, overflow: TextOverflow.ellipsis),
            trailing: TextButton(
              onPressed: () {
                final email = J.s(p['email']);
                setState(() => _out.contains(email) ? _out.remove(email) : _out.add(email));
                widget.onChanged([..._out]);
              },
              child: Text(_out.contains(J.s(p['email'])) ? (fr ? 'Remettre' : 'Put back') : (fr ? 'Retirer' : 'Remove')),
            ),
          ),
      ],
    );
  }
}
