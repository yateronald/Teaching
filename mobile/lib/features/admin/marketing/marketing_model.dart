import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/api/api_error.dart';
import '../../../core/constants/app_colors.dart';
import '../common/admin_kit.dart';

/// The marketing campaigns of the public site, as the admin API returns them
/// (/admin/promotions): group classes, offers, free events and announcements,
/// each shown on the site between two dates, with its registrations.

// ── Words ─────────────────────────────────────────────────────────────────

const campaignKinds = ['group_class', 'offer', 'event', 'announcement'];
const campaignAudiences = ['general', 'beginner', 'conversation', 'tcf', 'tef', 'delf', 'business', 'kids'];
const campaignCurrencies = ['CAD', 'USD', 'EUR'];
const registrationStatuses = ['new', 'contacted', 'confirmed', 'waitlist', 'cancelled'];

String kindLabel(String kind, bool fr) => switch (kind) {
  'offer' => fr ? 'Offre spéciale' : 'Special offer',
  'event' => fr ? 'Événement gratuit' : 'Free event',
  'announcement' => fr ? 'Annonce' : 'Announcement',
  _ => fr ? 'Cours en groupe' : 'Group class',
};

String kindHint(String kind, bool fr) => switch (kind) {
  'offer' => fr ? 'Une réduction ou un forfait, pour un temps limité.' : 'A discount or a pack, for a limited time.',
  'event' => fr ? 'Un atelier, un cours ouvert ou un webinaire gratuit.' : 'A free workshop, open class or webinar.',
  'announcement' => fr ? 'Une nouvelle à montrer sur le site, avec ou sans bouton.' : 'News to show on the site, with or without a button.',
  _ => fr ? 'Un groupe avec une date de début, un horaire et un nombre de places.' : 'A group with a start date, a timetable and a number of seats.',
};

IconData kindIcon(String kind) => switch (kind) {
  'offer' => Icons.local_offer_outlined,
  'event' => Icons.celebration_outlined,
  'announcement' => Icons.campaign_outlined,
  _ => Icons.groups_2_outlined,
};

String audienceLabel(String audience, bool fr) => switch (audience) {
  'beginner' => fr ? 'Débutants' : 'Beginners',
  'conversation' => 'Conversation',
  'tcf' => 'TCF Canada',
  'tef' => fr ? 'TEF Canada et Québec' : 'TEF Canada & Québec',
  'delf' => fr ? 'DELF et DALF' : 'DELF & DALF',
  'business' => fr ? 'Français des affaires' : 'Business French',
  'kids' => fr ? 'Enfants' : 'Children',
  _ => fr ? 'Tout le monde' : 'Everyone',
};

String stateLabel(String state, bool fr) => switch (state) {
  'live' => fr ? 'En ligne' : 'Live',
  'scheduled' => fr ? 'Programmée' : 'Scheduled',
  'paused' => fr ? 'En pause' : 'Paused',
  'ended' => fr ? 'Terminée' : 'Ended',
  'archived' => fr ? 'Archivée' : 'Archived',
  _ => fr ? 'Brouillon' : 'Draft',
};

Color stateColor(String state) => switch (state) {
  'live' => AppColors.good,
  'scheduled' => const Color(0xFF2563EB),
  'paused' => AppColors.warn,
  'archived' => AppColors.textSubtle,
  _ => AppColors.textMuted,
};

String registrationLabel(String status, bool fr) => switch (status) {
  'contacted' => fr ? 'Contactée' : 'Contacted',
  'confirmed' => fr ? 'Confirmée' : 'Confirmed',
  'waitlist' => fr ? 'Liste d’attente' : 'Waiting list',
  'cancelled' => fr ? 'Annulée' : 'Cancelled',
  _ => fr ? 'Nouvelle' : 'New',
};

String registrationHint(String status, bool fr) => switch (status) {
  'contacted' => fr ? 'Quelqu’un a écrit ou appelé ; la place n’est pas encore confirmée.' : 'Someone wrote or called; the seat is not confirmed yet.',
  'confirmed' => fr ? 'La place est confirmée.' : 'The seat is confirmed.',
  'waitlist' => fr ? 'Le groupe était complet lors de son inscription.' : 'The group was full when this person registered.',
  'cancelled' => fr ? 'La personne ne viendra pas ; sa place est de nouveau libre.' : 'The person will not join; the seat is free again.',
  _ => fr ? 'Personne ne l’a encore contactée.' : 'Nobody has contacted this person yet.',
};

Color registrationColor(String status) => switch (status) {
  'contacted' => AppColors.warn,
  'confirmed' => AppColors.good,
  'waitlist' => AppColors.textMuted,
  'cancelled' => AppColors.bad,
  _ => const Color(0xFF2563EB),
};

IconData registrationIcon(String status) => switch (status) {
  'contacted' => Icons.forum_outlined,
  'confirmed' => Icons.verified_outlined,
  'waitlist' => Icons.hourglass_empty,
  'cancelled' => Icons.cancel_outlined,
  _ => Icons.fiber_new_outlined,
};

String placeLabel(String place, bool fr) => switch (place) {
  'bar' => fr ? 'Bandeau du haut' : 'Top bar',
  'home' => fr ? 'Page d’accueil' : 'Home page',
  'flash' => fr ? 'Flash' : 'Flash pop-up',
  'learn' => fr ? 'Cours gratuits' : 'Free courses',
  'offers' => fr ? 'Page des offres' : 'Offers page',
  _ => fr ? 'Lien partagé' : 'Shared link',
};

IconData placeIcon(String place) => switch (place) {
  'bar' => Icons.horizontal_split_outlined,
  'home' => Icons.home_outlined,
  'flash' => Icons.flash_on_outlined,
  'learn' => Icons.menu_book_outlined,
  'offers' => Icons.storefront_outlined,
  _ => Icons.link,
};

// ── Looks ─────────────────────────────────────────────────────────────────

/// The colours of a campaign, the same five as on the site.
class CampaignTheme {
  final String id;
  final String en;
  final String fr;
  final Color a;
  final Color b;
  final Color accent;
  final Color soft;
  const CampaignTheme(this.id, this.en, this.fr, this.a, this.b, this.accent, this.soft);

  String name(bool fr) => fr ? this.fr : en;
  LinearGradient get gradient => LinearGradient(begin: Alignment.topLeft, end: Alignment.bottomRight, colors: [a, b]);
}

const campaignThemes = [
  CampaignTheme('navy', 'Navy', 'Marine', Color(0xFF1D4577), Color(0xFF0B1733), Color(0xFFF2B632), Color(0xFFEDF1F5)),
  CampaignTheme('bordeaux', 'Bordeaux', 'Bordeaux', Color(0xFFA83342), Color(0xFF4F121D), Color(0xFFFFD9A0), Color(0xFFF9EDEE)),
  CampaignTheme('gold', 'Gold', 'Or', Color(0xFF9C6609), Color(0xFF6F4405), Color(0xFFFFF1C9), Color(0xFFFBF3DF)),
  CampaignTheme('forest', 'Forest', 'Forêt', Color(0xFF1F7A59), Color(0xFF0C3526), Color(0xFFFFD77A), Color(0xFFE9F4EF)),
  CampaignTheme('plum', 'Plum', 'Prune', Color(0xFF6A45A3), Color(0xFF2A1849), Color(0xFFFFC9DE), Color(0xFFF1ECF8)),
];

CampaignTheme themeOf(String id) => campaignThemes.firstWhere((t) => t.id == id, orElse: () => campaignThemes.first);

/// The pictures of the site a campaign can use, grouped by what they show.
const campaignPictures = <(String, String, List<String>)>[
  (
    'Classes and teachers',
    'Cours et professeurs',
    [
      'teacher',
      'hub-hero',
      'cat-conversation',
      'course-small-talk',
      'course-opinions-debate',
      'course-spoken-french',
      'cat-grammar',
      'course-first-steps',
      'course-survival-dialogues',
      'games-hero',
    ],
  ),
  (
    'Exams',
    'Examens',
    [
      'cat-tcf',
      'cat-tef',
      'cat-delf',
      'course-tcf-speaking',
      'course-tcf-writing',
      'course-tcf-listening',
      'course-tcf-reading',
      'course-tef-speaking',
      'course-tef-writing',
      'course-delf-b2',
      'course-dalf-c1',
      'course-delf-a2',
      'placement',
    ],
  ),
  (
    'Work',
    'Travail',
    [
      'cat-business',
      'course-job-interview',
      'course-pro-emails',
      'course-customer-service-french',
      'course-healthcare-french',
      'course-jobs-work',
      'story-office',
    ],
  ),
  (
    'Life in Canada',
    'Vivre au Canada',
    [
      'course-settling-in-canada',
      'course-quebec-french',
      'course-school-parents',
      'story-airport',
      'story-apartment',
      'story-cafe',
      'course-everyday-life',
      'course-travel-french',
      'course-phone-french',
    ],
  ),
  (
    'Beginners, children, reading',
    'Débutants, enfants, lecture',
    [
      'cat-beginner',
      'course-kids-french',
      'kids-classroom',
      'course-cooking-french',
      'cat-reading',
      'course-classic-stories',
      'course-real-life-reading',
      'cat-listening',
      'cat-pronunciation',
      'course-french-idioms',
    ],
  ),
];

final _aiImage = RegExp(r'^ai-[a-f0-9]{12}$');

/// A picture the AI made for a campaign (served by the API, not by the site).
bool isAiImage(String? key) => key != null && _aiImage.hasMatch(key);

/// A picture of the site (or one the AI made): 640 px wide, or 1200 px when [large].
String campaignPictureUrl(String key, {bool large = false}) => isAiImage(key)
    ? '${ApiEndpoints.baseUrl}/public/promotions/images/$key${large ? '' : '-640'}.webp'
    : '${ApiEndpoints.siteUrl}/learn/img/$key${large ? '' : '-640'}.webp';

/// The address of a campaign on the public site: it opens the campaign directly.
String campaignUrl(String slug, {required bool fr}) => '${ApiEndpoints.siteUrl}${fr ? '/fr/offres/' : '/offers/'}?p=${Uri.encodeQueryComponent(slug)}';

/// True when the server answers that marketing is not installed (migration 026 not run).
bool marketingNotInstalled(Object error) => error is ApiException && error.statusCode == 503 && J.map(error.details)['code'] == 'PROMOTIONS_NOT_MIGRATED';

// ── A campaign ────────────────────────────────────────────────────────────

class Campaign {
  final Map<String, dynamic> raw;
  const Campaign(this.raw);

  factory Campaign.fromJson(Map<String, dynamic> json) => Campaign(json);

  int get id => J.i(raw['id']);
  String get slug => J.s(raw['slug']);
  String get kind => campaignKinds.contains(raw['kind']) ? J.s(raw['kind']) : 'group_class';
  String get status => J.s(raw['status']).isEmpty ? 'draft' : J.s(raw['status']);
  String get state => J.s(raw['state']).isEmpty ? status : J.s(raw['state']);

  /// A text in one language, or in the other one when it is missing.
  String? word(String field, bool fr) {
    final own = J.s(raw['${field}_${fr ? 'fr' : 'en'}']).trim();
    if (own.isNotEmpty) return own;
    final other = J.s(raw['${field}_${fr ? 'en' : 'fr'}']).trim();
    return other.isEmpty ? null : other;
  }

  /// The text written in exactly this language (for the editor).
  String own(String field, String lang) => J.s(raw['${field}_$lang']);

  String title(bool fr) => word('title', fr) ?? (fr ? 'Sans titre' : 'Untitled');
  List<String> highlights(bool fr) {
    List<String> of(String lang) =>
        (raw['highlights_$lang'] is List ? raw['highlights_$lang'] as List : const []).map((e) => '$e').where((e) => e.trim().isNotEmpty).toList();
    final mine = of(fr ? 'fr' : 'en');
    return mine.isNotEmpty ? mine : of(fr ? 'en' : 'fr');
  }

  String get audience => campaignAudiences.contains(raw['audience']) ? J.s(raw['audience']) : 'general';
  String? get level => _text('level');
  DateTime? get classStartsOn => _day('class_starts_on');
  DateTime? get classEndsOn => _day('class_ends_on');
  String? get teacher => _text('teacher_name');
  int? get seatLimit => raw['seat_limit'] == null ? null : J.i(raw['seat_limit']);
  bool get showSeats => raw['show_seats'] != false;
  num? get priceRegular => raw['price_regular'] == null ? null : J.n(raw['price_regular']);
  num? get pricePromo => raw['price_promo'] == null ? null : J.n(raw['price_promo']);
  String get currency => campaignCurrencies.contains(raw['currency']) ? J.s(raw['currency']) : 'CAD';
  DateTime get startsAt => J.date(raw['starts_at']) ?? DateTime.now();
  DateTime? get endsAt => J.date(raw['ends_at']);
  bool get showCountdown => raw['show_countdown'] != false;
  bool get placeBar => raw['place_bar'] == true;
  bool get placeHome => raw['place_home'] != false;
  bool get placeFlash => raw['place_flash'] == true;
  bool get placeLearn => raw['place_learn'] != false;
  int get priority => J.i(raw['priority']);
  String get theme => J.s(raw['theme']).isEmpty ? 'navy' : J.s(raw['theme']);
  String? get imageKey => _text('image_key');
  String get registrationMode => const ['form', 'link', 'none'].contains(raw['registration_mode']) ? J.s(raw['registration_mode']) : 'form';
  String? get ctaUrl => _text('cta_url');

  int get registrations => J.i(raw['registrations']);
  int get newRegistrations => J.i(raw['new_registrations']);
  int get seatsTaken => J.i(raw['seats_taken']);
  int? get seatsLeft => raw['seats_left'] == null ? null : J.i(raw['seats_left']);
  int get waitlist => J.i(raw['waitlist']);
  DateTime? get lastRegistrationAt => J.date(raw['last_registration_at']);
  int get views => J.i(raw['views']);
  int get clicks => J.i(raw['clicks']);

  bool get full => seatLimit != null && seatsTaken >= seatLimit!;
  bool get isLive => state == 'live';
  bool get hasPrice => priceRegular != null || pricePromo != null;

  /// The places of the site where it shows.
  List<String> get places => [if (placeBar) 'bar', if (placeHome) 'home', if (placeFlash) 'flash', if (placeLearn) 'learn'];

  String? _text(String key) {
    final v = J.s(raw[key]).trim();
    return v.isEmpty ? null : v;
  }

  DateTime? _day(String key) {
    final v = J.s(raw[key]);
    return v.length < 10 ? null : DateTime.tryParse(v.substring(0, 10));
  }
}

/// The words of the button, as the site writes them; null when there is no button.
String? campaignCta(Campaign c, bool fr) {
  if (c.registrationMode == 'none' && c.word('cta', fr) == null) return null;
  if (c.full && c.registrationMode == 'form') return fr ? 'Rejoindre la liste d’attente' : 'Join the waiting list';
  return c.word('cta', fr) ??
      switch (c.kind) {
        'offer' => fr ? 'Profiter de l’offre' : 'Get this offer',
        'event' => fr ? 'Réserver ma place' : 'Save my spot',
        'announcement' => fr ? 'En savoir plus' : 'Learn more',
        _ => fr ? 'Réserver ma place' : 'Reserve my seat',
      };
}

// ── Formatting ────────────────────────────────────────────────────────────

/// "249 $ CAD", "$249 CAD", "199 €".
String campaignMoney(num value, String currency, bool fr) {
  final symbol = currency == 'EUR' ? '€' : r'$';
  final f = NumberFormat.currency(locale: fr ? 'fr_FR' : 'en_US', symbol: symbol, decimalDigits: value % 1 == 0 ? 0 : 2);
  return currency == 'EUR' ? f.format(value) : '${f.format(value)} $currency';
}

/// "Ends in 3 days", "Se termine dans 5 h"; null without an end date or once it has passed.
String? campaignTimeLeft(DateTime? end, bool fr) {
  if (end == null) return null;
  final left = end.difference(DateTime.now());
  if (left.isNegative) return null;
  if (left.inDays >= 2) return fr ? 'Se termine dans ${left.inDays} jours' : 'Ends in ${left.inDays} days';
  if (left.inHours >= 1) return fr ? 'Se termine dans ${left.inHours} h' : 'Ends in ${left.inHours} h';
  return fr ? 'Se termine dans ${left.inMinutes.clamp(1, 59)} min' : 'Ends in ${left.inMinutes.clamp(1, 59)} min';
}

/// "12.5 %" of a whole, or "—".
String campaignRate(int part, int whole) {
  if (whole <= 0) return '—';
  final v = (part / whole * 1000).round() / 10;
  return '${v % 1 == 0 ? v.toInt() : v} %';
}

/// The digits of a phone number for a WhatsApp link.
String whatsAppNumber(String phone) => phone.replaceAll(RegExp(r'[^0-9]'), '');
