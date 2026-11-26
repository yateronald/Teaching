import 'package:flutter/material.dart';

/// Portal customization settings for a company's white-label sign-in page
/// (`/o/<slug>`), app shell accent, and learner invitation emails.
class PortalBranding {
  final String primaryColor;
  final String secondaryColor;
  final String surfaceTone; // clean | warm | slate
  final String loginLayout; // split | centered | minimal
  final String heroStyle; // geometric | gradient | solid | cover
  final String coverPlacement; // hero | full | card
  final int coverOverlay; // 0..90 (displayed as image opacity = 100 - coverOverlay)
  final String buttonStyle; // rounded | pill | sharp
  final String tagline;
  final String headline;
  final String heroBody;
  final String welcomeMessage;
  final List<String>? highlights;
  final bool showHighlights;
  final String websiteUrl;
  final String supportEmail;
  final String footerText;
  final bool hideBackToHome;
  final bool hidePoweredBy;
  final bool securityBadge;

  const PortalBranding({
    this.primaryColor = '#16325C',
    this.secondaryColor = '#0F766E',
    this.surfaceTone = 'clean',
    this.loginLayout = 'split',
    this.heroStyle = 'geometric',
    this.coverPlacement = 'hero',
    this.coverOverlay = 55,
    this.buttonStyle = 'rounded',
    this.tagline = '',
    this.headline = '',
    this.heroBody = '',
    this.welcomeMessage = '',
    this.highlights,
    this.showHighlights = true,
    this.websiteUrl = '',
    this.supportEmail = '',
    this.footerText = '',
    this.hideBackToHome = true,
    this.hidePoweredBy = true,
    this.securityBadge = true,
  });

  static const _layouts = ['split', 'centered', 'minimal'];
  static const _heroes = ['geometric', 'gradient', 'solid', 'cover'];
  static const _placements = ['hero', 'full', 'card'];
  static const _surfaces = ['clean', 'warm', 'slate'];
  static const _buttons = ['rounded', 'pill', 'sharp'];

  static String _cleanMultiline(dynamic raw, int maxLen) {
    if (raw == null) return '';
    final normalized = '$raw'.replaceAll('\r\n', '\n').replaceAll('\r', '\n').trim();
    return normalized.length > maxLen ? normalized.substring(0, maxLen) : normalized;
  }

  factory PortalBranding.fromJson(Map<String, dynamic>? j) {
    if (j == null || j.isEmpty) return const PortalBranding();
    String str(String k) => (j[k] == null ? '' : '${j[k]}').trim();
    final primaryRaw = str('primary_color').toUpperCase();
    final secondaryRaw = str('secondary_color').toUpperCase();
    final rawOverlay = j['cover_overlay'] is num
        ? (j['cover_overlay'] as num).round()
        : int.tryParse(str('cover_overlay')) ?? 55;
    final rawHighlights = j['highlights'];
    List<String>? parsedHighlights;
    if (rawHighlights is List) {
      parsedHighlights = rawHighlights
          .map((e) => '$e'.trim())
          .where((e) => e.isNotEmpty)
          .take(4)
          .toList();
    }

    return PortalBranding(
      primaryColor: isValidHexColor(primaryRaw) ? primaryRaw : '#16325C',
      secondaryColor: isValidHexColor(secondaryRaw) ? secondaryRaw : '#0F766E',
      surfaceTone: _surfaces.contains(j['surface_tone']) ? '${j['surface_tone']}' : 'clean',
      loginLayout: _layouts.contains(j['login_layout']) ? '${j['login_layout']}' : 'split',
      heroStyle: _heroes.contains(j['hero_style']) ? '${j['hero_style']}' : 'geometric',
      coverPlacement: _placements.contains(j['cover_placement']) ? '${j['cover_placement']}' : 'hero',
      coverOverlay: rawOverlay.clamp(0, 90),
      buttonStyle: _buttons.contains(j['button_style']) ? '${j['button_style']}' : 'rounded',
      tagline: str('tagline'),
      headline: str('headline'),
      heroBody: _cleanMultiline(j['hero_body'], 1000),
      welcomeMessage: str('welcome_message'),
      highlights: parsedHighlights,
      showHighlights: j['show_highlights'] is bool ? j['show_highlights'] as bool : true,
      websiteUrl: isValidHttpsPortalUrl(str('website_url')) ? str('website_url') : '',
      supportEmail: isValidSupportEmail(str('support_email')) ? str('support_email').toLowerCase() : '',
      footerText: str('footer_text'),
      hideBackToHome: j['hide_back_to_home'] is bool ? j['hide_back_to_home'] as bool : true,
      hidePoweredBy: j['hide_powered_by'] is bool ? j['hide_powered_by'] as bool : true,
      securityBadge: j['security_badge'] is bool ? j['security_badge'] as bool : true,
    );
  }

  Map<String, dynamic> toJson() => {
        'primary_color': primaryColor,
        'secondary_color': secondaryColor,
        'surface_tone': surfaceTone,
        'login_layout': loginLayout,
        'hero_style': heroStyle,
        'cover_placement': coverPlacement,
        'cover_overlay': coverOverlay,
        'button_style': buttonStyle,
        'tagline': tagline,
        'headline': headline,
        'hero_body': heroBody,
        'welcome_message': welcomeMessage,
        'highlights': highlights,
        'show_highlights': showHighlights,
        'website_url': websiteUrl,
        'support_email': supportEmail,
        'footer_text': footerText,
        'hide_back_to_home': hideBackToHome,
        'hide_powered_by': hidePoweredBy,
        'security_badge': securityBadge,
      };

  PortalBranding copyWith({
    String? primaryColor,
    String? secondaryColor,
    String? surfaceTone,
    String? loginLayout,
    String? heroStyle,
    String? coverPlacement,
    int? coverOverlay,
    String? buttonStyle,
    String? tagline,
    String? headline,
    String? heroBody,
    String? welcomeMessage,
    List<String>? highlights,
    bool clearHighlights = false,
    bool? showHighlights,
    String? websiteUrl,
    String? supportEmail,
    String? footerText,
    bool? hideBackToHome,
    bool? hidePoweredBy,
    bool? securityBadge,
  }) {
    return PortalBranding(
      primaryColor: primaryColor ?? this.primaryColor,
      secondaryColor: secondaryColor ?? this.secondaryColor,
      surfaceTone: surfaceTone ?? this.surfaceTone,
      loginLayout: loginLayout ?? this.loginLayout,
      heroStyle: heroStyle ?? this.heroStyle,
      coverPlacement: coverPlacement ?? this.coverPlacement,
      coverOverlay: coverOverlay ?? this.coverOverlay,
      buttonStyle: buttonStyle ?? this.buttonStyle,
      tagline: tagline ?? this.tagline,
      headline: headline ?? this.headline,
      heroBody: heroBody ?? this.heroBody,
      welcomeMessage: welcomeMessage ?? this.welcomeMessage,
      highlights: clearHighlights ? null : (highlights ?? this.highlights),
      showHighlights: showHighlights ?? this.showHighlights,
      websiteUrl: websiteUrl ?? this.websiteUrl,
      supportEmail: supportEmail ?? this.supportEmail,
      footerText: footerText ?? this.footerText,
      hideBackToHome: hideBackToHome ?? this.hideBackToHome,
      hidePoweredBy: hidePoweredBy ?? this.hidePoweredBy,
      securityBadge: securityBadge ?? this.securityBadge,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    if (other is! PortalBranding) return false;
    final sameHighlights = (highlights == null && other.highlights == null) ||
        (highlights != null &&
            other.highlights != null &&
            highlights!.length == other.highlights!.length &&
            Iterable.generate(highlights!.length, (i) => highlights![i] == other.highlights![i]).every((e) => e));
    return primaryColor == other.primaryColor &&
        secondaryColor == other.secondaryColor &&
        surfaceTone == other.surfaceTone &&
        loginLayout == other.loginLayout &&
        heroStyle == other.heroStyle &&
        coverPlacement == other.coverPlacement &&
        coverOverlay == other.coverOverlay &&
        buttonStyle == other.buttonStyle &&
        tagline == other.tagline &&
        headline == other.headline &&
        heroBody == other.heroBody &&
        welcomeMessage == other.welcomeMessage &&
        sameHighlights &&
        showHighlights == other.showHighlights &&
        websiteUrl == other.websiteUrl &&
        supportEmail == other.supportEmail &&
        footerText == other.footerText &&
        hideBackToHome == other.hideBackToHome &&
        hidePoweredBy == other.hidePoweredBy &&
        securityBadge == other.securityBadge;
  }

  @override
  int get hashCode => Object.hashAll([
        primaryColor,
        secondaryColor,
        surfaceTone,
        loginLayout,
        heroStyle,
        coverPlacement,
        coverOverlay,
        buttonStyle,
        tagline,
        headline,
        heroBody,
        welcomeMessage,
        highlights == null ? null : Object.hashAll(highlights!),
        showHighlights,
        websiteUrl,
        supportEmail,
        footerText,
        hideBackToHome,
        hidePoweredBy,
        securityBadge,
      ]);
}

class PortalThemePreset {
  final String id;
  final String name;
  final String nameFr;
  final String primaryColor;
  final String secondaryColor;
  final String surfaceTone;
  final String heroStyle;

  const PortalThemePreset({
    required this.id,
    required this.name,
    required this.nameFr,
    required this.primaryColor,
    required this.secondaryColor,
    required this.surfaceTone,
    required this.heroStyle,
  });
}

const List<PortalThemePreset> portalThemePresets = [
  PortalThemePreset(
    id: 'executive-navy',
    name: 'Executive Navy',
    nameFr: 'Bleu Nuit',
    primaryColor: '#16325C',
    secondaryColor: '#0F766E',
    surfaceTone: 'clean',
    heroStyle: 'geometric',
  ),
  PortalThemePreset(
    id: 'forest-emerald',
    name: 'Forest Emerald',
    nameFr: 'Émeraude',
    primaryColor: '#065F46',
    secondaryColor: '#0EA5E9',
    surfaceTone: 'clean',
    heroStyle: 'gradient',
  ),
  PortalThemePreset(
    id: 'slate-amber',
    name: 'Slate & Amber',
    nameFr: 'Ardoise & Ambre',
    primaryColor: '#1E293B',
    secondaryColor: '#D97706',
    surfaceTone: 'warm',
    heroStyle: 'geometric',
  ),
  PortalThemePreset(
    id: 'royal-indigo',
    name: 'Royal Indigo',
    nameFr: 'Indigo Royal',
    primaryColor: '#312E81',
    secondaryColor: '#2563EB',
    surfaceTone: 'slate',
    heroStyle: 'gradient',
  ),
  PortalThemePreset(
    id: 'bordeaux',
    name: 'Bordeaux Editorial',
    nameFr: 'Bordeaux',
    primaryColor: '#7F1D1D',
    secondaryColor: '#B45309',
    surfaceTone: 'warm',
    heroStyle: 'solid',
  ),
  PortalThemePreset(
    id: 'carbon',
    name: 'Carbon Modern',
    nameFr: 'Carbone',
    primaryColor: '#18181B',
    secondaryColor: '#0284C7',
    surfaceTone: 'clean',
    heroStyle: 'geometric',
  ),
];

const List<String> portalQuickSwatches = [
  '#16325C',
  '#065F46',
  '#1E293B',
  '#312E81',
  '#7F1D1D',
  '#18181B',
  '#0E7490',
  '#0F766E',
  '#2563EB',
  '#D97706',
];

final RegExp _hexRe = RegExp(r'^#[0-9a-fA-F]{6}$');
final RegExp _slugRe = RegExp(r'^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$');
final RegExp _emailRe = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$');
final RegExp _ipv4Re = RegExp(r'^\d{1,3}(?:\.\d{1,3}){3}$');

const Set<String> _reservedSlugs = {
  'admin', 'api', 'app', 'auth', 'login', 'logout', 'o', 'org', 'public',
  'static', 'assets', 'meeting', 'meetings', 'learn', 'offers', 'fr', 'en',
  'register', 'reset', 'demo', 'pricing', 'privacy', 'terms', 'contact',
};

bool isValidHexColor(String raw) => _hexRe.hasMatch(raw.trim());

bool isValidPortalSlug(String raw) {
  final s = raw.trim().toLowerCase();
  return _slugRe.hasMatch(s) && !_reservedSlugs.contains(s);
}

bool isValidSupportEmail(String raw) {
  final s = raw.trim();
  return s.isEmpty || (_emailRe.hasMatch(s) && s.length <= 120);
}

bool isValidHttpsPortalUrl(String raw) {
  final s = raw.trim();
  if (s.isEmpty) return true;
  if (s.length > 200) return false;
  final uri = Uri.tryParse(s);
  if (uri == null || uri.scheme.toLowerCase() != 'https' || uri.userInfo.isNotEmpty) return false;
  final host = uri.host.toLowerCase();
  if (host.isEmpty || !host.contains('.') || host == 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) {
    return false;
  }
  if (_ipv4Re.hasMatch(host) || host.contains(':')) return false;
  return true;
}

Color parseHexColor(String hex, [Color fallback = const Color(0xFF16325C)]) {
  final clean = hex.trim();
  if (!_hexRe.hasMatch(clean)) return fallback;
  return Color(int.parse('FF${clean.substring(1)}', radix: 16));
}

Color contrastForeground(Color bg) =>
    bg.computeLuminance() > 0.42 ? const Color(0xFF0F172A) : Colors.white;

bool isLightHex(String hex) => parseHexColor(hex).computeLuminance() > 0.65;

Color heroDeepColor(Color primary) {
  final ratio = primary.computeLuminance() > 0.28 ? 0.78 : 0.56;
  return Color.lerp(primary, const Color(0xFF09111F), ratio)!;
}

Color heroMidColor(Color primary) {
  final ratio = primary.computeLuminance() > 0.28 ? 0.56 : 0.32;
  return Color.lerp(primary, const Color(0xFF09111F), ratio)!;
}

Color surfaceToneColor(String tone) {
  switch (tone) {
    case 'warm':
      return const Color(0xFFFAF8F4);
    case 'slate':
      return const Color(0xFFEFF3F8);
    default:
      return const Color(0xFFF8FAFC);
  }
}
