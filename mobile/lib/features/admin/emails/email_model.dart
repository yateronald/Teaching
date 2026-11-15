import 'package:flutter/material.dart';
import '../../../core/api/api_error.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';

/// Email campaigns, as the admin API returns them (/admin/email-campaigns):
/// one email written in French and English (content.fr / content.en), up to
/// two buttons that open a page, a form or a WhatsApp group, an optional price
/// box, a design (layout, header, fonts, colours), the people it goes to, and
/// what it brought (opens, clicks, answers to the form, unsubscribes).

// ── Words ─────────────────────────────────────────────────────────────────

const emailStatuses = ['draft', 'scheduled', 'sending', 'paused', 'sent', 'cancelled'];
const emailGoals = ['group', 'offer', 'survey', 'whatsapp', 'event', 'news', 'reminder'];
const emailSources = ['students', 'candidates', 'demos', 'registrations'];
const emailLanguageModes = ['auto', 'fr', 'en', 'both'];
const emailExams = ['tcf_canada', 'tcf_quebec', 'tcf_tp'];
const emailActions = ['link', 'form', 'whatsapp'];
const emailFieldTypes = ['name', 'email', 'phone', 'text', 'textarea', 'select', 'radio', 'checkbox', 'date'];
const emailChoiceTypes = ['select', 'radio', 'checkbox'];
const emailResponseStatuses = ['new', 'contacted', 'done'];

/// The words of one language (as the server keeps them), and the two lists.
const emailWordKeys = [
  'subject', 'preheader', 'eyebrow', 'headline', 'body', 'highlights_title', 'steps_title',
  'offer_label', 'offer_note', 'deadline', 'primary_label', 'secondary_label', 'signature', 'ps',
  'form_title', 'form_intro', 'form_submit', 'form_thanks_title', 'form_thanks_text',
];
const emailListKeys = ['highlights', 'steps'];
const emailListMax = {'highlights': 5, 'steps': 4};

String emailStatusLabel(String s, bool fr) => switch (s) {
  'scheduled' => fr ? 'Programmé' : 'Scheduled',
  'sending' => fr ? 'Envoi en cours' : 'Sending',
  'paused' => fr ? 'En pause' : 'Paused',
  'sent' => fr ? 'Envoyé' : 'Sent',
  'cancelled' => fr ? 'Annulé' : 'Cancelled',
  _ => fr ? 'Brouillon' : 'Draft',
};

Color emailStatusColor(String s) => switch (s) {
  'scheduled' => AppColors.adminAccent,
  'sending' => AppColors.good,
  'paused' => AppColors.warn,
  'sent' => AppColors.good,
  _ => AppColors.textMuted,
};

String goalLabel(String g, bool fr) => switch (g) {
  'offer' => fr ? 'Une offre' : 'An offer',
  'survey' => fr ? 'Un questionnaire' : 'A survey',
  'whatsapp' => fr ? 'Groupe WhatsApp' : 'WhatsApp group',
  'event' => fr ? 'Un événement' : 'An event',
  'news' => fr ? 'Une nouvelle' : 'News',
  'reminder' => fr ? 'Un rappel' : 'A reminder',
  _ => fr ? 'Remplir un groupe' : 'Fill a group',
};

IconData goalIcon(String g) => switch (g) {
  'offer' => Icons.local_offer_outlined,
  'survey' => Icons.assignment_outlined,
  'whatsapp' => Icons.forum_outlined,
  'event' => Icons.event_outlined,
  'news' => Icons.campaign_outlined,
  'reminder' => Icons.notifications_none,
  _ => Icons.groups_outlined,
};

/// Ready-made starts for the AI brief (the same as on the web): label, goal, main button, text.
List<(String, String, String, String)> emailAiIdeas(bool fr) => [
  (
    fr ? 'Relancer les demandes d’essai' : 'Follow up trial requests',
    'group',
    'form',
    fr
        ? 'Relancer les personnes qui ont demandé un cours d’essai sans s’inscrire. Notre prochain groupe [niveau] commence le [date], [jours et heure] heure de Montréal, [8] places, [prix]. Le bouton ouvre un formulaire pour réserver (niveau et disponibilités).'
        : 'Follow up the people who asked for a trial class but did not register. Our next group [level] starts on [date], [days and time] Montréal time, [8] seats, [price]. The button opens a form to book a seat (their level and availability).',
  ),
  (
    fr ? 'Questionnaire aux élèves' : 'Questions to students',
    'survey',
    'form',
    fr
        ? 'Poser trois ou quatre questions courtes à nos élèves sur leurs cours : ce qu’ils aiment, ce qu’il faut améliorer, quel nouveau cours ils aimeraient. Deux minutes.'
        : 'Ask our students three or four short questions about their classes: what they like, what to improve, which new course they would like. It takes two minutes.',
  ),
  (
    fr ? 'Groupe WhatsApp' : 'WhatsApp group',
    'whatsapp',
    'whatsapp',
    fr
        ? 'Les inviter à rejoindre notre groupe WhatsApp gratuit : chaque semaine un court exercice, des conseils pour le TCF et les réponses d’une professeure native.'
        : 'Invite them to join our free WhatsApp group: every week a short French exercise, tips for the TCF and answers from a native teacher.',
  ),
  (
    fr ? 'Offre limitée' : 'Offer with a deadline',
    'offer',
    'link',
    fr
        ? '[-20 %] sur [quoi] jusqu’au [date] pour [qui]. Dire clairement ce qu’ils obtiennent et comment en profiter.'
        : '[-20 %] on [what] until [date] for [who]. Say clearly what they get and how to take advantage of it.',
  ),
];

String actionLabel(String a, bool fr) => switch (a) {
  'form' => fr ? 'Un formulaire' : 'A form',
  'whatsapp' => 'WhatsApp',
  'none' => fr ? 'Aucun' : 'None',
  _ => fr ? 'Une page' : 'A page',
};

IconData actionIcon(String a) => switch (a) {
  'form' => Icons.assignment_outlined,
  'whatsapp' => Icons.forum_outlined,
  'none' => Icons.block,
  _ => Icons.link,
};

String sourceLabel(String s, bool fr) => switch (s) {
  'candidates' || 'candidate' => fr ? 'Candidats aux examens' : 'Exam candidates',
  'demos' || 'demo' => fr ? 'Demandes de cours d’essai' : 'Trial class requests',
  'registrations' || 'registration' => fr ? 'Inscriptions aux campagnes' : 'Campaign registrations',
  _ => fr ? 'Élèves' : 'Students',
};

IconData sourceIcon(String s) => switch (s) {
  'candidates' || 'candidate' => Icons.badge_outlined,
  'demos' || 'demo' => Icons.support_agent_outlined,
  'registrations' || 'registration' => Icons.how_to_reg_outlined,
  _ => Icons.groups_outlined,
};

String languageModeLabel(String m, bool fr) => switch (m) {
  'fr' => fr ? 'Français seulement' : 'French only',
  'en' => fr ? 'Anglais seulement' : 'English only',
  'both' => fr ? 'Bilingue (français puis anglais)' : 'Bilingual (French, then English)',
  _ => fr ? 'La langue de chaque personne' : 'Each person’s language',
};

String recipientStatusLabel(String s, bool fr) => switch (s) {
  'queued' || 'sending' => fr ? 'En attente' : 'Waiting',
  'sent' => fr ? 'Envoyé' : 'Sent',
  'delivered' => fr ? 'Délivré' : 'Delivered',
  'failed' => fr ? 'Échec' : 'Failed',
  'bounced' => fr ? 'Rejeté' : 'Bounced',
  _ => fr ? 'Non envoyé' : 'Not sent',
};

String fieldTypeLabel(String t, bool fr) => switch (t) {
  'name' => fr ? 'Nom' : 'Name',
  'email' => 'Email',
  'phone' => fr ? 'Téléphone' : 'Phone',
  'textarea' => fr ? 'Texte long' : 'Long text',
  'select' => fr ? 'Liste' : 'Drop-down',
  'radio' => fr ? 'Un choix' : 'One choice',
  'checkbox' => fr ? 'Plusieurs choix' : 'Several choices',
  'date' => 'Date',
  _ => fr ? 'Texte court' : 'Short text',
};

String responseStatusLabel(String s, bool fr) => switch (s) {
  'contacted' => fr ? 'Contactée' : 'Contacted',
  'done' => fr ? 'Traitée' : 'Done',
  _ => fr ? 'Nouvelle' : 'New',
};

Color responseStatusColor(String s) => switch (s) {
  'contacted' => AppColors.adminAccent,
  'done' => AppColors.good,
  _ => AppColors.warn,
};

const _examNames = {'tcf_canada': 'TCF Canada', 'tcf_quebec': 'TCF Québec', 'tcf_tp': 'TCF Tout public'};
String examLabel(String e) => _examNames[e] ?? e;

/// « 46.2% » in English, « 46,2 % » in French, or a dash.
String emailRate(dynamic rate, {bool fr = false}) {
  if (rate == null) return '—';
  final v = (J.n(rate) * 1000).round() / 10;
  final n = '${v % 1 == 0 ? v.toInt() : v}';
  return fr ? '${n.replaceAll('.', ',')} %' : '$n%';
}

/// « 1 person », « 3 people » / « 0 personne », « 3 personnes ».
String emailPeople(int n, bool fr) => fr ? '$n ${n <= 1 ? 'personne' : 'personnes'}' : '$n ${n == 1 ? 'person' : 'people'}';

/// The AI's known refusals in both languages (the others keep the server's words).
const _aiTexts = {
  'AI_BRIEF_SHORT': ('Describe the email in a sentence or two (what it is about, for whom, the action you want).', 'Décrivez l’email en une ou deux phrases (de quoi il parle, pour qui, l’action voulue).'),
  'AI_WHATSAPP': ('The WhatsApp link must be a group invitation (https://chat.whatsapp.com/…).', 'Le lien WhatsApp doit être une invitation de groupe (https://chat.whatsapp.com/…).'),
  'AI_LINK': ('The button link must start with https://.', 'Le lien du bouton doit commencer par https://.'),
  'AI_LIMIT': ('The AI has done a lot in the last hour. Try again a little later.', 'L’IA a beaucoup travaillé dans la dernière heure. Réessayez un peu plus tard.'),
  'AI_ONE_LANGUAGE': ('The AI wrote only one language. Try again.', 'L’IA n’a écrit qu’une langue. Réessayez.'),
  'AI_NO_SUBJECT': ('The AI did not write a subject. Try again with a little more detail.', 'L’IA n’a pas écrit d’objet. Réessayez avec un peu plus de détails.'),
  'AI_PROMPT_SHORT': ('Describe the picture in a sentence (who, where, doing what).', 'Décrivez l’image en une phrase (qui, où, en train de faire quoi).'),
  'AI_IMAGE_UNSAFE': ('The picture could not be made safely. Change the description and try again.', 'L’image n’a pas pu être faite sans risque. Changez la description et réessayez.'),
};

/// One problem the server found in an email (a save refused with code EMAIL_INVALID), in plain words.
String? _issueText(Map<String, dynamic> i, bool fr) {
  final which = i['button'] == 'secondary' ? (fr ? 'deuxième bouton' : 'second button') : (fr ? 'bouton principal' : 'main button');
  return switch (J.s(i['code'])) {
    'LINK_HTTPS' => fr ? 'le lien du $which doit commencer par https://' : 'the link of the $which must start with https://',
    'WHATSAPP_LINK' => fr ? 'le $which a besoin d’une invitation de groupe WhatsApp (https://chat.whatsapp.com/…)' : 'the $which needs a WhatsApp group invitation (https://chat.whatsapp.com/…)',
    'FORM_EMAIL' => fr ? 'le formulaire a besoin d’une question Email, pour répondre aux personnes' : 'the form needs an Email question, to answer people',
    'FIELD_LABEL' => fr ? 'une question du formulaire n’a pas d’intitulé' : 'a form question has no words',
    'FIELD_CHOICES' => fr ? 'la question « ${J.s(i['field_fr']).isEmpty ? J.s(i['field']) : J.s(i['field_fr'])} » a besoin de choix' : 'the question « ${J.s(i['field'])} » needs choices',
    'PICTURE' => fr ? 'l’image est inconnue : choisissez-en une autre' : 'the picture is unknown: choose another one',
    _ => null,
  };
}

/// What went wrong, said plainly: each problem of the email, the AI's known refusals,
/// otherwise the server's own explanation (not just its title).
String emailErrorText(BuildContext context, Object error) {
  final fr = context.isFrench;
  if (error is ApiException) {
    final d = J.map(error.details);
    final issues = (d['issues'] is List ? d['issues'] as List : const []).map((e) => _issueText(J.map(e), fr)).whereType<String>().toList();
    if (issues.isNotEmpty) return '${fr ? 'À corriger' : 'To fix'} : ${issues.join(' · ')}.';
    final ai = _aiTexts[J.s(d['code'])];
    if (ai != null) return fr ? ai.$2 : ai.$1;
    final message = J.s(d['message']).trim();
    if (message.isNotEmpty) return message;
  }
  return apiErrorText(context, error);
}

/// Before migration 029: the server says how to install email campaigns.
bool emailsNotInstalled(Object error) => error is ApiException && error.statusCode == 503 && J.map(error.details)['code'] == 'EMAILS_NOT_MIGRATED';

// The same rule as the server: what follows « ? » (WhatsApp now copies « …?mode=ems_copy_t ») is allowed, and dropped by the server.
final _waRe = RegExp(r'^https://(chat\.whatsapp\.com/[A-Za-z0-9]{10,40}|wa\.me/[0-9]{6,16}|(www\.)?whatsapp\.com/channel/[A-Za-z0-9]{10,40})/?(\?[^\s#]*)?$');
bool isWhatsAppInvite(String url) => _waRe.hasMatch(url.trim());
bool isHttpsLink(String url) => RegExp(r'^https://[^\s<>"]{3,}$', caseSensitive: false).hasMatch(url.trim());

// ── Copies the editor can change ──────────────────────────────────────────

List<String> _strings(dynamic v) => v is List ? v.map((e) => '$e').where((e) => e.trim().isNotEmpty).toList() : <String>[];

/// The words of one language, every key present.
Map<String, dynamic> wordsCopy(dynamic raw) {
  final src = J.map(raw);
  return {
    for (final k in emailWordKeys) k: J.s(src[k]).trim().isEmpty ? null : J.s(src[k]),
    for (final k in emailListKeys) k: _strings(src[k]),
  };
}

Map<String, dynamic> buttonCopy(dynamic raw, {bool secondary = false}) {
  final src = J.map(raw);
  final action = [...emailActions, if (secondary) 'none'].contains(src['action']) ? J.s(src['action']) : (secondary ? 'none' : 'link');
  final url = J.s(src['url']).trim();
  return {'action': action, 'url': (action == 'link' || action == 'whatsapp') && url.isNotEmpty ? url : null};
}

Map<String, dynamic> offerCopy(dynamic raw) {
  final src = J.map(raw);
  num? price(dynamic v) => v == null || '$v'.trim().isEmpty ? null : num.tryParse('$v');
  return {
    'show': src['show'] == true,
    'regular': price(src['regular']),
    'promo': price(src['promo']),
    'currency': ['CAD', 'USD', 'EUR'].contains(src['currency']) ? src['currency'] : 'CAD',
  };
}

Map<String, dynamic> formFieldCopy(dynamic raw) {
  final f = J.map(raw);
  final type = emailFieldTypes.contains(f['type']) ? J.s(f['type']) : 'text';
  return {
    'id': J.s(f['id']).isEmpty ? type : J.s(f['id']),
    'type': type,
    'required': f['required'] == true,
    'label_fr': J.s(f['label_fr']).trim().isEmpty ? null : J.s(f['label_fr']),
    'label_en': J.s(f['label_en']).trim().isEmpty ? null : J.s(f['label_en']),
    if (emailChoiceTypes.contains(type)) 'options_fr': _strings(f['options_fr']),
    if (emailChoiceTypes.contains(type)) 'options_en': _strings(f['options_en']),
  };
}

List<Map<String, dynamic>> formFieldsOf(dynamic form) => (J.map(form)['fields'] is List ? J.map(form)['fields'] as List : const []).map(formFieldCopy).toList();

/// The usual questions of a new form.
List<Map<String, dynamic>> defaultFormFields() => [
  {'id': 'name', 'type': 'name', 'required': true, 'label_fr': 'Prénom et nom', 'label_en': 'First and last name'},
  {'id': 'email', 'type': 'email', 'required': true, 'label_fr': 'Adresse email', 'label_en': 'Email address'},
  {'id': 'phone', 'type': 'phone', 'required': false, 'label_fr': 'Téléphone ou WhatsApp', 'label_en': 'Phone or WhatsApp'},
];

/// A new question of this type, with an id the form does not use yet.
Map<String, dynamic> newFormField(String type, List<Map<String, dynamic>> existing) {
  final used = existing.map((f) => J.s(f['id'])).toSet();
  var id = type;
  var n = 2;
  while (used.contains(id)) {
    id = '${type}_${n++}';
  }
  return formFieldCopy({'id': id, 'type': type, 'required': type == 'name' || type == 'email', 'options_fr': <String>[], 'options_en': <String>[]});
}

/// Ready-made questions the school often asks.
List<(String, Map<String, dynamic>)> formTemplates(bool fr) => [
  (fr ? 'Niveau de français' : 'French level', {
    'id': 'level', 'type': 'select', 'required': true, 'label_fr': 'Votre niveau de français', 'label_en': 'Your French level',
    'options_fr': ['Débutant', 'A1', 'A2', 'B1', 'B2', 'Je ne sais pas'], 'options_en': ['Beginner', 'A1', 'A2', 'B1', 'B2', 'I don’t know'],
  }),
  (fr ? 'Disponibilités' : 'Availability', {
    'id': 'availability', 'type': 'checkbox', 'required': false, 'label_fr': 'Quand êtes-vous disponible ?', 'label_en': 'When are you available?',
    'options_fr': ['En semaine, le jour', 'En semaine, le soir', 'Le week-end'], 'options_en': ['Weekdays, daytime', 'Weekday evenings', 'Weekends'],
  }),
  (fr ? 'Objectif' : 'Goal', {
    'id': 'goal', 'type': 'radio', 'required': false, 'label_fr': 'Votre objectif', 'label_en': 'Your goal',
    'options_fr': ['Immigration (TEF / TCF)', 'Travail', 'Études', 'Plaisir'], 'options_en': ['Immigration (TEF / TCF)', 'Work', 'Studies', 'For fun'],
  }),
  (fr ? 'Date d’examen' : 'Exam date', {'id': 'exam_date', 'type': 'date', 'required': false, 'label_fr': 'Date de votre examen (si connue)', 'label_en': 'Your exam date (if known)'}),
];

bool usesFormButtons(Map<String, dynamic> buttons) => [buttons['primary'], buttons['secondary']].any((b) => J.map(b)['action'] == 'form');

// ── Design ────────────────────────────────────────────────────────────────

const emailPresets = ['classic', 'hero', 'minimal', 'bold', 'editorial'];
const emailHeaders = ['band', 'hero', 'logo', 'centered', 'none'];
const emailFonts = ['system', 'humanist', 'georgia', 'trebuchet', 'verdana'];
const emailDesignStyles = ['professional', 'modern', 'elegant', 'warm', 'bold', 'minimal'];

/// The design the server gives a new email (classic, navy), if the server sent none.
const _fallbackDesign = {
  'preset': 'classic', 'theme': 'navy', 'header': 'band', 'logo': 'top', 'align': 'left', 'font': 'system', 'heading_font': 'system',
  'heading_size': 28, 'body_size': 16, 'radius': 16, 'button_shape': 'rounded', 'button_width': 'auto', 'spacing': 'normal',
  'points': 'checks', 'card': 'border',
  'colors': {
    'primary': '#1d4577', 'accent': '#f2b632', 'header_bg': '#0b1733', 'header_text': '#ffffff', 'page_bg': '#f2f4f7',
    'card_bg': '#ffffff', 'heading': '#0b1733', 'text': '#1b2333', 'muted': '#5b6578', 'soft': '#edf1f5',
  },
};

/// A deep copy of a design (or of the classic layout from the server's list).
Map<String, dynamic> designCopy(dynamic raw, [Map<String, dynamic>? meta]) {
  final src = J.map(raw).isNotEmpty ? J.map(raw) : J.map(J.map(J.map(meta?['design'])['presets'])['classic']);
  final base = src.isEmpty ? _fallbackDesign : src;
  return {...base, 'colors': {...J.map(_fallbackDesign['colors']), ...J.map(base['colors'])}};
}

/// A layout in a palette: the school's colours, or a theme's (as on the web).
Map<String, dynamic> recolorDesign(Map<String, dynamic> d, String theme, Map<String, dynamic> meta) {
  final b = J.map(J.map(J.map(meta['design'])['brand'])[theme]);
  final next = designCopy(d);
  next['theme'] = theme;
  if (b.isEmpty) return next;
  final c = J.map(next['colors']);
  final white = J.s(c['header_bg']).toLowerCase() == '#ffffff';
  String pick(String k) => J.s(b[k]).isNotEmpty ? J.s(b[k]) : J.s(c[k]);
  next['colors'] = {
    ...c,
    'primary': pick('primary'), 'accent': pick('accent'), 'soft': pick('soft'), 'heading': pick('heading'),
    'header_bg': white ? '#ffffff' : pick('header_bg'),
    'header_text': white ? pick('heading') : '#ffffff',
  };
  return next;
}

/// A colour of the design, for the little swatches.
Color designColor(Map<String, dynamic> d, String key, [Color fallback = AppColors.adminAccent]) {
  final hex = J.s(J.map(d['colors'])[key]).replaceFirst('#', '');
  final v = int.tryParse(hex.length == 6 ? 'ff$hex' : '', radix: 16);
  return v == null ? fallback : Color(v);
}

String presetLabel(String p, bool fr) => switch (p) {
  'hero' => 'Photo',
  'minimal' => fr ? 'Épuré' : 'Minimal',
  'bold' => fr ? 'Percutant' : 'Bold',
  'editorial' => fr ? 'Éditorial' : 'Editorial',
  _ => fr ? 'Classique' : 'Classic',
};

String headerLabel(String h, bool fr) => switch (h) {
  'hero' => 'Photo',
  'logo' => 'Logo',
  'centered' => fr ? 'Centré' : 'Centred',
  'none' => fr ? 'Aucun' : 'None',
  'auto' => fr ? 'Au choix de l’IA' : 'AI’s choice',
  _ => fr ? 'Bandeau' : 'Colour band',
};

String fontLabel(String f) => switch (f) {
  'humanist' => 'Humanist',
  'georgia' => 'Georgia',
  'trebuchet' => 'Trebuchet',
  'verdana' => 'Verdana',
  _ => 'System',
};

String designStyleLabel(String s, bool fr) => switch (s) {
  'modern' => fr ? 'Moderne' : 'Modern',
  'elegant' => fr ? 'Élégant' : 'Elegant',
  'warm' => fr ? 'Chaleureux' : 'Warm',
  'bold' => fr ? 'Percutant' : 'Bold',
  'minimal' => fr ? 'Épuré' : 'Minimal',
  _ => fr ? 'Professionnel' : 'Professional',
};

// ── The AI: the model to write with, the picture ─────────────────────────

/// The writers the administrator may pick (Vertex), with what each did lately:
/// state 'ok', 'missing' (not on this project), 'busy', 'error' or null.
List<Map<String, dynamic>> modelChoices(dynamic list) => (list is List ? list : const [])
    .map((e) => J.map(e))
    .where((m) => J.s(m['id']).isNotEmpty)
    .map((m) => {'id': J.s(m['id']), 'label': J.s(m['label']).isEmpty ? J.s(m['id']) : J.s(m['label']), 'state': m['state']})
    .toList();

String? modelStateLabel(dynamic state, bool fr) => switch (state) {
  'ok' => fr ? 'répond' : 'answers',
  'missing' => fr ? 'pas disponible sur votre projet' : 'not available on your project',
  'busy' => fr ? 'occupé en ce moment' : 'busy right now',
  'error' => fr ? 'a refusé le dernier appel' : 'refused the last call',
  _ => null,
};

/// Where the picture goes: 'top' (the « Photo » header) or 'inline' (under the headline).
String pictureOf(Map<String, dynamic> design) => design['header'] == 'hero' ? 'top' : 'inline';

/// The design with the picture at this place (a « Photo » header only when it is at the top).
Map<String, dynamic> placePicture(Map<String, dynamic> design, String place) {
  final d = designCopy(design);
  if (place == 'top') {
    d['header'] = 'hero';
  } else if (d['header'] == 'hero') {
    d['header'] = 'band';
  }
  return d;
}

// ── The audience ──────────────────────────────────────────────────────────

Map<String, dynamic> blankAudience() => {
  'sources': <String>[],
  'students': {'state': 'active', 'batches': <int>[]},
  'candidates': {'exams': <String>[]},
  'demos': {'statuses': <String>[], 'since_days': 180, 'interest': null, 'exclude_students': true},
  'registrations': {'promotion_ids': <int>[], 'statuses': <String>[]},
};

/// A deep copy of the audience the editor can change.
Map<String, dynamic> audienceCopy(dynamic a) {
  final base = blankAudience();
  final src = J.map(a);
  List<T> listOf<T>(dynamic v) => v is List ? v.whereType<T>().toList() : <T>[];
  final students = J.map(src['students']);
  final candidates = J.map(src['candidates']);
  final demos = J.map(src['demos']);
  final regs = J.map(src['registrations']);
  return {
    'sources': listOf<String>(src['sources']),
    'students': {
      'state': ['active', 'inactive', 'all'].contains(students['state']) ? students['state'] : 'active',
      'batches': listOf<num>(students['batches']).map((n) => n.toInt()).toList(),
    },
    'candidates': {'exams': listOf<String>(candidates['exams'])},
    'demos': {
      'statuses': listOf<String>(demos['statuses']),
      'since_days': demos.containsKey('since_days') ? demos['since_days'] : (base['demos'] as Map)['since_days'],
      'interest': demos['interest'],
      'exclude_students': demos['exclude_students'] != false,
    },
    'registrations': {
      'promotion_ids': listOf<num>(regs['promotion_ids']).map((n) => n.toInt()).toList(),
      'statuses': listOf<String>(regs['statuses']),
    },
  };
}

// ── A campaign ────────────────────────────────────────────────────────────

class EmailCampaign {
  final Map<String, dynamic> raw;
  const EmailCampaign(this.raw);

  int get id => J.i(raw['id']);
  String get status => emailStatuses.contains(raw['status']) ? J.s(raw['status']) : 'draft';
  String get name => J.s(raw['name']).trim().isEmpty ? subject(true) : J.s(raw['name']);
  String get goal => emailGoals.contains(raw['goal']) ? J.s(raw['goal']) : 'news';
  String get languageMode => emailLanguageModes.contains(raw['language_mode']) ? J.s(raw['language_mode']) : 'auto';
  String get defaultLang => raw['default_lang'] == 'en' ? 'en' : 'fr';
  int? get promotionId => raw['promotion_id'] == null ? null : J.i(raw['promotion_id']);
  String? get imageKey => J.s(raw['image_key']).trim().isEmpty ? null : J.s(raw['image_key']);
  Map<String, dynamic> get audience => audienceCopy(raw['audience']);
  List<String> get excluded => (raw['excluded'] is List ? raw['excluded'] as List : const []).map((e) => '$e').toList();
  DateTime? get scheduledAt => J.date(raw['scheduled_at']);
  DateTime? get startedAt => J.date(raw['started_at']);
  DateTime? get finishedAt => J.date(raw['finished_at']);
  DateTime? get updatedAt => J.date(raw['updated_at']);
  String? get note => J.s(raw['note']).trim().isEmpty ? null : J.s(raw['note']);

  Map<String, dynamic> words(String lang) => wordsCopy(J.map(raw['content'])[lang]);
  Map<String, dynamic> get buttons => {
    'primary': buttonCopy(J.map(raw['buttons'])['primary']),
    'secondary': buttonCopy(J.map(raw['buttons'])['secondary'], secondary: true),
  };
  Map<String, dynamic> get offer => offerCopy(raw['offer']);
  Map<String, dynamic> get design => designCopy(raw['design']);
  List<Map<String, dynamic>> get formFields => formFieldsOf(raw['form']);
  bool get usesForm => usesFormButtons(buttons);

  /// A word in one language, or in the other one when it is missing.
  String? word(String field, bool fr) {
    final own = J.s(words(fr ? 'fr' : 'en')[field]).trim();
    if (own.isNotEmpty) return own;
    final other = J.s(words(fr ? 'en' : 'fr')[field]).trim();
    return other.isEmpty ? null : other;
  }

  String subject(bool fr) => word('subject', fr) ?? (fr ? 'Sans objet' : 'No subject yet');

  Map<String, dynamic> get stats => J.map(raw['stats']);
  int stat(String k) => J.i(stats[k]);
  double get progress => J.n(stats['progress']).toDouble();
  bool get isDraft => status == 'draft';
}

/// What is missing before sending (the same rules as the server, said early).
/// [f] is the email as the API takes it (content, buttons, form…).
List<String> emailMissing(Map<String, dynamic> f, bool fr, {String? postalAddress, int? recipients}) {
  final mode = J.s(f['language_mode']);
  final langs = mode == 'fr' ? ['fr'] : mode == 'en' ? ['en'] : mode == 'both' ? ['fr', 'en'] : [f['default_lang'] == 'en' ? 'en' : 'fr'];
  final content = J.map(f['content']);
  final out = <String>[];
  for (final l in langs) {
    final w = J.map(content[l]);
    final name = l == 'fr' ? (fr ? 'en français' : 'in French') : (fr ? 'en anglais' : 'in English');
    if (J.s(w['subject']).trim().isEmpty) out.add(fr ? 'un objet $name' : 'a subject $name');
    if (J.s(w['body']).trim().isEmpty) out.add(fr ? 'un message $name' : 'a message $name');
  }
  final buttons = J.map(f['buttons']);
  for (final k in ['primary', 'secondary']) {
    final b = buttonCopy(buttons[k], secondary: k == 'secondary');
    final which = k == 'primary' ? (fr ? 'du bouton principal' : 'the main button’s') : (fr ? 'du deuxième bouton' : 'the second button’s');
    final url = J.s(J.map(buttons[k])['url']).trim();
    if (b['action'] == 'link') {
      if (url.isEmpty) out.add(fr ? 'le lien $which' : '$which link');
      if (url.isNotEmpty && !isHttpsLink(url)) out.add(fr ? 'un lien $which qui commence par https://' : '$which link starting with https://');
    }
    if (b['action'] == 'whatsapp') {
      if (url.isEmpty) out.add(fr ? 'le lien du groupe WhatsApp' : 'the WhatsApp group link');
      if (url.isNotEmpty && !isWhatsAppInvite(url)) out.add(fr ? 'un lien d’invitation WhatsApp' : 'a WhatsApp invitation link');
    }
  }
  if (usesFormButtons(buttons)) {
    final fields = formFieldsOf(f['form']);
    if (!fields.any((x) => x['type'] == 'email')) out.add(fr ? 'une question « Email » dans le formulaire' : 'an « Email » question in the form');
    for (final x in fields) {
      if (emailChoiceTypes.contains(x['type']) && (x['options_fr'] as List).isEmpty && (x['options_en'] as List).isEmpty) {
        out.add(fr ? 'des choix pour « ${J.s(x['label_fr'] ?? x['label_en'] ?? x['id'])} »' : 'choices for « ${J.s(x['label_en'] ?? x['label_fr'] ?? x['id'])} »');
      }
    }
  }
  if (postalAddress != null && postalAddress.trim().isEmpty) {
    out.add(fr ? 'l’adresse postale de l’école (Expéditeur)' : 'the school’s postal address (Sender details)');
  }
  if (recipients != null && recipients < 1) out.add(fr ? 'au moins un destinataire' : 'at least one recipient');
  return out.toSet().toList();
}

// ── Answers to the form ───────────────────────────────────────────────────

class FormAnswer {
  final Map<String, dynamic> raw;
  const FormAnswer(this.raw);

  int get id => J.i(raw['id']);
  String get name => J.s(raw['name']);
  String get email => J.s(raw['email']);
  String? get phone => J.s(raw['phone']).trim().isEmpty ? null : J.s(raw['phone']);
  String get lang => raw['lang'] == 'en' ? 'en' : 'fr';
  String get status => emailResponseStatuses.contains(raw['status']) ? J.s(raw['status']) : 'new';
  String get notes => J.s(raw['notes']);
  String? get source => J.s(raw['source']).isEmpty ? null : J.s(raw['source']);
  DateTime? get createdAt => J.date(raw['created_at']);
  Map<String, dynamic> get answers => J.map(raw['answers']);

  /// The answer to one question, as text (« A1 », « Le soir, Le week-end »).
  String answer(String fieldId) {
    final v = answers[fieldId];
    if (v is List) return v.map((e) => '$e').join(', ');
    return J.s(v);
  }
}

/// The question as the administrator reads it.
String fieldLabel(Map<String, dynamic> f, bool fr) {
  final own = J.s(f[fr ? 'label_fr' : 'label_en']).trim();
  if (own.isNotEmpty) return own;
  final other = J.s(f[fr ? 'label_en' : 'label_fr']).trim();
  return other.isEmpty ? J.s(f['id']) : other;
}
