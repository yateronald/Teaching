import 'dart:typed_data';
import 'package:flutter/material.dart';
import '../../../core/constants/app_typography.dart';
import 'hero_rich_field.dart';
import 'portal_branding.dart';

/// Interactive WYSIWYG preview of the company's `/o/<slug>` sign-in portal.
/// Supports Desktop vs Mobile viewports, Email vs Password steps, and EN/FR.
class PortalLoginPreview extends StatefulWidget {
  final String companyName;
  final String slug;
  final PortalBranding branding;
  final String? logoUrl;
  final Uint8List? logoBytes;
  final String? coverUrl;
  final Uint8List? coverBytes;
  final String initialLanguage;
  final VoidCallback? onCopyLink;
  final VoidCallback? onOpenLive;

  const PortalLoginPreview({
    super.key,
    required this.companyName,
    required this.slug,
    required this.branding,
    this.logoUrl,
    this.logoBytes,
    this.coverUrl,
    this.coverBytes,
    this.initialLanguage = 'en',
    this.onCopyLink,
    this.onOpenLive,
  });

  @override
  State<PortalLoginPreview> createState() => _PortalLoginPreviewState();
}

class _PortalLoginPreviewState extends State<PortalLoginPreview> {
  String _viewport = 'desktop'; // desktop | mobile
  String _step = 'email'; // email | password
  late String _lang = widget.initialLanguage == 'fr' ? 'fr' : 'en';

  @override
  void didUpdateWidget(covariant PortalLoginPreview oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.initialLanguage != widget.initialLanguage) {
      _lang = widget.initialLanguage == 'fr' ? 'fr' : 'en';
    }
  }

  String _tr(String en, String fr) => _lang == 'fr' ? fr : en;

  @override
  Widget build(BuildContext context) {
    final name = widget.companyName.trim().isEmpty ? 'Your Company' : widget.companyName.trim();
    final slug = widget.slug.trim().isEmpty ? 'company' : widget.slug.trim();
    final urlText = 'https://learnfrenchwithnatives.com/o/$slug';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE2E8F0)),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF0F172A).withValues(alpha: 0.06),
            blurRadius: 16,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Toolbar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
            color: Colors.white,
            child: Wrap(
              spacing: 8,
              runSpacing: 8,
              alignment: WrapAlignment.spaceBetween,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      _tr('Live sign-in preview', 'Aperçu en direct'),
                      style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
                    ),
                    Text(
                      _tr('What learners see at /o/$slug', 'Ce que voient vos apprenants sur /o/$slug'),
                      style: AppTypography.caption.copyWith(color: const Color(0xFF64748B), fontSize: 11),
                    ),
                  ],
                ),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    SegmentedButton<String>(
                      showSelectedIcon: false,
                      style: const ButtonStyle(
                        visualDensity: VisualDensity.compact,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      segments: const [
                        ButtonSegment(value: 'desktop', icon: Icon(Icons.desktop_windows_outlined, size: 15)),
                        ButtonSegment(value: 'mobile', icon: Icon(Icons.smartphone, size: 15)),
                      ],
                      selected: {_viewport},
                      onSelectionChanged: (s) => setState(() => _viewport = s.first),
                    ),
                    SegmentedButton<String>(
                      showSelectedIcon: false,
                      style: const ButtonStyle(
                        visualDensity: VisualDensity.compact,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      segments: [
                        ButtonSegment(value: 'email', label: Text('1. Email', style: const TextStyle(fontSize: 11.5))),
                        ButtonSegment(value: 'password', label: Text(_tr('2. Pass', '2. Passe'), style: const TextStyle(fontSize: 11.5))),
                      ],
                      selected: {_step},
                      onSelectionChanged: (s) => setState(() => _step = s.first),
                    ),
                    SegmentedButton<String>(
                      showSelectedIcon: false,
                      style: const ButtonStyle(
                        visualDensity: VisualDensity.compact,
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      segments: const [
                        ButtonSegment(value: 'en', label: Text('EN', style: TextStyle(fontSize: 11.5))),
                        ButtonSegment(value: 'fr', label: Text('FR', style: TextStyle(fontSize: 11.5))),
                      ],
                      selected: {_lang},
                      onSelectionChanged: (s) => setState(() => _lang = s.first),
                    ),
                    if (widget.onCopyLink != null)
                      IconButton(
                        tooltip: _tr('Copy link', 'Copier le lien'),
                        icon: const Icon(Icons.copy, size: 17),
                        visualDensity: VisualDensity.compact,
                        onPressed: widget.onCopyLink,
                      ),
                    if (widget.onOpenLive != null)
                      IconButton(
                        tooltip: _tr('Open live portal', 'Ouvrir le portail'),
                        icon: const Icon(Icons.open_in_new, size: 17),
                        visualDensity: VisualDensity.compact,
                        onPressed: widget.onOpenLive,
                      ),
                  ],
                ),
              ],
            ),
          ),

          // Browser chrome bar
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            decoration: const BoxDecoration(
              color: Color(0xFFF1F5F9),
              border: Border.symmetric(horizontal: BorderSide(color: Color(0xFFE2E8F0))),
            ),
            child: Row(
              children: [
                for (var i = 0; i < 3; i++) ...[
                  Container(width: 7, height: 7, decoration: const BoxDecoration(color: Color(0xFFCBD5E1), shape: BoxShape.circle)),
                  if (i < 2) const SizedBox(width: 4),
                ],
                const SizedBox(width: 10),
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(color: const Color(0xFFE2E8F0)),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.lock_outline, size: 12, color: Color(0xFF16A34A)),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            urlText,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 11, color: Color(0xFF475569), fontWeight: FontWeight.w500),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Stage
          Container(
            color: const Color(0xFFE2E8F0),
            padding: EdgeInsets.all(_viewport == 'mobile' ? 14 : 0),
            child: _viewport == 'desktop'
                ? AspectRatio(
                    aspectRatio: 960 / 640,
                    child: FittedBox(
                      fit: BoxFit.contain,
                      child: SizedBox(
                        width: 960,
                        height: 640,
                        child: _LoginCanvas(
                          companyName: name,
                          branding: widget.branding,
                          logoUrl: widget.logoUrl,
                          logoBytes: widget.logoBytes,
                          coverUrl: widget.coverUrl,
                          coverBytes: widget.coverBytes,
                          lang: _lang,
                          step: _step,
                          mobile: false,
                          onToggleStep: (s) => setState(() => _step = s),
                        ),
                      ),
                    ),
                  )
                : Center(
                    child: Container(
                      width: 288,
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F172A),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.25), blurRadius: 18, offset: const Offset(0, 8)),
                        ],
                      ),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Container(
                            width: 64,
                            height: 4,
                            margin: const EdgeInsets.only(bottom: 6),
                            decoration: BoxDecoration(color: const Color(0xFF334155), borderRadius: BorderRadius.circular(9)),
                          ),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(18),
                            child: SizedBox(
                              height: 480,
                              width: double.infinity,
                              child: SingleChildScrollView(
                                physics: const ClampingScrollPhysics(),
                                child: _LoginCanvas(
                                  companyName: name,
                                  branding: widget.branding,
                                  logoUrl: widget.logoUrl,
                                  logoBytes: widget.logoBytes,
                                  coverUrl: widget.coverUrl,
                                  coverBytes: widget.coverBytes,
                                  lang: _lang,
                                  step: _step,
                                  mobile: true,
                                  onToggleStep: (s) => setState(() => _step = s),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

/// Opens the WYSIWYG portal preview inside a spacious modal dialog.
Future<void> showPortalPreviewDialog(
  BuildContext context, {
  required String companyName,
  required String slug,
  required PortalBranding branding,
  String? logoUrl,
  Uint8List? logoBytes,
  String? coverUrl,
  Uint8List? coverBytes,
  String initialLanguage = 'en',
}) {
  final fr = initialLanguage == 'fr';
  return showDialog<void>(
    context: context,
    builder: (ctx) => Dialog(
      insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 720),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Text(
                      fr ? 'Aperçu du portail de connexion' : 'Sign-in portal preview',
                      style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800),
                    ),
                    const Spacer(),
                    IconButton(
                      icon: const Icon(Icons.close),
                      onPressed: () => Navigator.of(ctx).pop(),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                PortalLoginPreview(
                  companyName: companyName,
                  slug: slug,
                  branding: branding,
                  logoUrl: logoUrl,
                  logoBytes: logoBytes,
                  coverUrl: coverUrl,
                  coverBytes: coverBytes,
                  initialLanguage: initialLanguage,
                ),
              ],
            ),
          ),
        ),
      ),
    ),
  );
}

class _LoginCanvas extends StatelessWidget {
  final String companyName;
  final PortalBranding branding;
  final String? logoUrl;
  final Uint8List? logoBytes;
  final String? coverUrl;
  final Uint8List? coverBytes;
  final String lang;
  final String step;
  final bool mobile;
  final ValueChanged<String> onToggleStep;

  const _LoginCanvas({
    required this.companyName,
    required this.branding,
    required this.logoUrl,
    required this.logoBytes,
    required this.coverUrl,
    required this.coverBytes,
    required this.lang,
    required this.step,
    required this.mobile,
    required this.onToggleStep,
  });

  String _tr(String en, String fr) => lang == 'fr' ? fr : en;

  @override
  Widget build(BuildContext context) {
    final primary = parseHexColor(branding.primaryColor);
    final secondary = parseHexColor(branding.secondaryColor, const Color(0xFF0F766E));
    final primaryFg = contrastForeground(primary);
    final surface = surfaceToneColor(branding.surfaceTone);
    final hasCover = coverBytes != null || (coverUrl != null && coverUrl!.isNotEmpty);
    final placement = branding.coverPlacement;
    final isFullBg = hasCover && placement == 'full';
    final isHeroBg = hasCover && placement == 'hero' && branding.heroStyle == 'cover';
    final isCardImg = hasCover && placement == 'card';
    final effectiveHero = branding.heroStyle == 'cover' && !isHeroBg ? 'geometric' : branding.heroStyle;
    final imageOpacity = ((100 - branding.coverOverlay).clamp(10, 100)) / 100.0;
    final hasHeroBody = branding.heroBody.trim().isNotEmpty;
    final tagline = branding.tagline.isNotEmpty ? branding.tagline : _tr('Exam preparation', 'Préparation aux examens');
    final headline = branding.headline.isNotEmpty ? branding.headline : _tr('Prepare for the TCF with $companyName', 'Préparez le TCF avec $companyName');
    final sub = branding.welcomeMessage.isNotEmpty
        ? branding.welcomeMessage
        : step == 'email'
            ? _tr("Sign in to $companyName's learning portal.", "Connectez-vous à l'espace de formation de $companyName.")
            : _tr('Prepare for your exam with $companyName: practice tests, corrections and results in one place.',
                'Préparez votre examen avec $companyName : examens blancs, corrections et résultats au même endroit.');
    final chips = (branding.highlights != null && branding.highlights!.isNotEmpty)
        ? branding.highlights!
        : _tr('Reading|Listening|Writing|Speaking', 'Écrit|Oral|Rédaction|Expression').split('|');
    final footerCopy = branding.footerText.isNotEmpty ? branding.footerText : '© ${DateTime.now().year} $companyName';
    final btnRadius = branding.buttonStyle == 'pill' ? 999.0 : branding.buttonStyle == 'sharp' ? 6.0 : 10.0;

    Widget coverImg() => Opacity(
          opacity: imageOpacity,
          child: coverBytes != null
              ? Image.memory(coverBytes!, fit: BoxFit.cover)
              : Image.network(coverUrl!, fit: BoxFit.cover, errorBuilder: (_, _, _) => const SizedBox.shrink()),
        );

    BoxDecoration brandHeroDecoration() => BoxDecoration(
          color: heroDeepColor(primary),
          gradient: effectiveHero == 'solid'
              ? null
              : effectiveHero == 'gradient'
                  ? LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [heroDeepColor(primary), heroMidColor(primary), Color.lerp(secondary, const Color(0xFF09111F), 0.35)!],
                    )
                  : LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [heroDeepColor(primary), heroMidColor(primary)],
                    ),
        );

    Widget heroBg() => Positioned.fill(
          child: Stack(
            fit: StackFit.expand,
            children: [
              Container(decoration: brandHeroDecoration()),
              if (isHeroBg) coverImg(),
              if (isHeroBg) Container(color: const Color(0xFF09111F).withValues(alpha: 0.14)),
              if (effectiveHero == 'geometric') CustomPaint(painter: _GridPainter()),
            ],
          ),
        );

    Widget fullBgLayer() => Positioned.fill(
          child: Stack(
            fit: StackFit.expand,
            children: [
              Container(decoration: brandHeroDecoration()),
              coverImg(),
              Container(color: const Color(0xFF09111F).withValues(alpha: 0.18)),
            ],
          ),
        );

    Widget? featureCard({bool centered = false, bool light = false}) {
      if (!isCardImg) return null;
      return Container(
        constraints: BoxConstraints(maxWidth: centered ? (mobile ? 220 : 320) : 340),
        margin: EdgeInsets.only(bottom: mobile ? 8 : 12),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: light ? const Color(0xFFE2E8F0) : Colors.white.withValues(alpha: 0.24)),
          color: light ? Colors.white : const Color(0xFF09111F).withValues(alpha: 0.22),
          boxShadow: [
            BoxShadow(color: const Color(0xFF09111F).withValues(alpha: light ? 0.1 : 0.3), blurRadius: 14, offset: const Offset(0, 6)),
          ],
        ),
        clipBehavior: Clip.antiAlias,
        child: SizedBox(
          width: double.infinity,
          height: mobile ? 76 : 108,
          child: coverImg(),
        ),
      );
    }

    Widget mark(double size) {
      final initial = companyName.isEmpty ? 'C' : companyName[0].toUpperCase();
      Widget inner = Text(initial, style: TextStyle(fontSize: size * 0.42, fontWeight: FontWeight.w800, color: primary));
      if (logoBytes != null) {
        inner = Image.memory(logoBytes!, fit: BoxFit.contain);
      } else if (logoUrl != null && logoUrl!.isNotEmpty) {
        inner = Image.network(logoUrl!, fit: BoxFit.contain, errorBuilder: (_, _, _) => inner);
      }
      return Container(
        width: size,
        height: size,
        padding: EdgeInsets.all(size * 0.12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(size * 0.26),
          border: Border.all(color: const Color(0xFFE2E8F0)),
        ),
        alignment: Alignment.center,
        child: inner,
      );
    }

    Widget topPills() => Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.95),
                borderRadius: BorderRadius.circular(999),
                border: Border.all(color: const Color(0xFFE2E8F0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.language, size: 12, color: Color(0xFF475569)),
                  const SizedBox(width: 4),
                  Text(lang.toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: Color(0xFF334155))),
                ],
              ),
            ),
            if (branding.websiteUrl.isNotEmpty) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.95),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.arrow_back, size: 11, color: Color(0xFF0F172A)),
                    if (!mobile) ...[
                      const SizedBox(width: 4),
                      Text(_tr('Visit $companyName', 'Site $companyName'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF0F172A))),
                    ],
                  ],
                ),
              ),
            ] else if (!branding.hideBackToHome) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.95),
                  borderRadius: BorderRadius.circular(999),
                  border: Border.all(color: const Color(0xFFE2E8F0)),
                ),
                child: Text(_tr('Back to home', 'Accueil'), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFF0F172A))),
              ),
            ],
          ],
        );

    Widget loginCard() => Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 380),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: const Color(0xFFE2E8F0)),
            boxShadow: [
              BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.12), blurRadius: 24, offset: const Offset(0, 12)),
            ],
          ),
          clipBehavior: Clip.antiAlias,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                height: 4,
                decoration: BoxDecoration(gradient: LinearGradient(colors: [primary, secondary])),
              ),
              Padding(
                padding: EdgeInsets.all(mobile ? 18 : 26),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        mark(mobile ? 40 : 46),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Row(
                            children: [
                              Container(width: 6, height: 6, decoration: BoxDecoration(color: primary, shape: BoxShape.circle)),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  (branding.tagline.isNotEmpty ? branding.tagline : companyName).toUpperCase(),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w800, letterSpacing: 1.0, color: primary),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 14),
                    Text(
                      step == 'email' ? _tr('Sign in', 'Connexion') : _tr('Welcome back', 'Bon retour'),
                      style: TextStyle(fontSize: mobile ? 20 : 24, fontWeight: FontWeight.w800, color: const Color(0xFF0F172A)),
                    ),
                    const SizedBox(height: 4),
                    Text(sub, style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569), height: 1.4)),
                    const SizedBox(height: 16),
                    if (step == 'password') ...[
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        margin: const EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF8FAFC),
                          borderRadius: BorderRadius.circular(999),
                          border: Border.all(color: const Color(0xFFE2E8F0)),
                        ),
                        child: Row(
                          children: [
                            CircleAvatar(radius: 12, backgroundColor: primary, child: Text('A', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: primaryFg))),
                            const SizedBox(width: 8),
                            const Expanded(child: Text('alex.martin@company.com', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFF0F172A)), overflow: TextOverflow.ellipsis)),
                            GestureDetector(
                              onTap: () => onToggleStep('email'),
                              child: Text(_tr('Change', 'Modifier'), style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w700, color: primary)),
                            ),
                            const SizedBox(width: 6),
                          ],
                        ),
                      ),
                    ],
                    Text(
                      (step == 'email' ? _tr('Email address', 'Adresse email') : _tr('Password', 'Mot de passe')).toUpperCase(),
                      style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, letterSpacing: 0.9, color: Color(0xFF64748B)),
                    ),
                    const SizedBox(height: 5),
                    Container(
                      height: 40,
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF8FAFC),
                        borderRadius: BorderRadius.circular(branding.buttonStyle == 'sharp' ? 6 : 10),
                        border: Border.all(color: const Color(0xFFE2E8F0)),
                      ),
                      child: Row(
                        children: [
                          Icon(step == 'email' ? Icons.mail_outline : Icons.lock_outline, size: 15, color: const Color(0xFF64748B)),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              step == 'email' ? 'alex.martin@company.com' : '••••••••••',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 12.5, color: Color(0xFF475569)),
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (step == 'password') ...[
                      const SizedBox(height: 8),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Text(_tr('Forgot password?', 'Mot de passe oublié ?'), style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.w600, color: primary)),
                      ),
                    ],
                    const SizedBox(height: 14),
                    InkWell(
                      onTap: () => onToggleStep(step == 'email' ? 'password' : 'email'),
                      child: Container(
                        height: 42,
                        decoration: BoxDecoration(
                          color: primary,
                          borderRadius: BorderRadius.circular(btnRadius),
                        ),
                        alignment: Alignment.center,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text(
                              step == 'email' ? _tr('Continue', 'Continuer') : _tr('Sign in', 'Se connecter'),
                              style: TextStyle(fontSize: 13.5, fontWeight: FontWeight.w700, color: primaryFg),
                            ),
                            if (step == 'email') ...[
                              const SizedBox(width: 6),
                              Icon(Icons.arrow_forward, size: 15, color: primaryFg),
                            ],
                          ],
                        ),
                      ),
                    ),
                    if (branding.securityBadge || branding.supportEmail.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      const Divider(height: 1, color: Color(0xFFF1F5F9)),
                      const SizedBox(height: 10),
                      Center(
                        child: Column(
                          children: [
                            if (branding.securityBadge)
                              Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.verified_user_outlined, size: 13, color: Color(0xFF16A34A)),
                                  const SizedBox(width: 5),
                                  Flexible(
                                    child: Text(
                                      _tr('Private $companyName access', 'Accès privé $companyName'),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: const TextStyle(fontSize: 11, color: Color(0xFF64748B)),
                                    ),
                                  ),
                                ],
                              ),
                            if (branding.supportEmail.isNotEmpty) ...[
                              const SizedBox(height: 3),
                              Text(
                                '${_tr('Need help?', 'Besoin d’aide ?')} ${branding.supportEmail}',
                                style: TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: primary),
                              ),
                            ],
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        );

    Widget footer({bool onDark = false}) => Column(
          children: [
            Text(
              footerCopy,
              style: TextStyle(fontSize: 11, color: onDark ? Colors.white.withValues(alpha: 0.88) : const Color(0xFF64748B)),
              textAlign: TextAlign.center,
            ),
            if (!branding.hidePoweredBy) ...[
              const SizedBox(height: 2),
              Text(
                '${_tr('Powered by', 'Propulsé par')} Learn French with Natives',
                style: TextStyle(fontSize: 10.5, fontWeight: FontWeight.w600, color: onDark ? Colors.white.withValues(alpha: 0.88) : const Color(0xFF64748B)),
              ),
            ],
          ],
        );

    Widget wrapDesktopClip(Widget child) => mobile
        ? child
        : SingleChildScrollView(physics: const NeverScrollableScrollPhysics(), child: child);

    if (branding.loginLayout == 'centered' || branding.loginLayout == 'minimal') {
      final centered = branding.loginLayout == 'centered';
      final showTopBanner = (centered && !isFullBg) || (!centered && isHeroBg);
      final lightIntro = centered || isFullBg || isHeroBg;
      final pad = mobile ? 12.0 : 18.0;
      final cardNode = featureCard(centered: true, light: !lightIntro);

      final introContent = Padding(
        padding: EdgeInsets.fromLTRB(pad, pad, pad, showTopBanner ? (centered ? 40 : 18) : 10),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Row(
              children: [
                mark(mobile ? 34 : 38),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(companyName, style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: lightIntro ? Colors.white : const Color(0xFF0F172A)), overflow: TextOverflow.ellipsis),
                      Text(tagline, style: TextStyle(fontSize: 11, color: lightIntro ? Colors.white70 : const Color(0xFF64748B)), overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
                topPills(),
              ],
            ),
            SizedBox(height: mobile ? 10 : 14),
            if (cardNode != null) cardNode,
            Text(
              headline,
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(fontSize: mobile ? 16 : 21, fontWeight: FontWeight.w800, color: lightIntro ? Colors.white : const Color(0xFF0F172A)),
            ),
            if (hasHeroBody) ...[
              const SizedBox(height: 8),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 460),
                child: HeroRichPreviewText(
                  text: branding.heroBody,
                  light: lightIntro,
                  centered: true,
                  compact: mobile,
                  accentColor: lightIntro ? secondary : primary,
                ),
              ),
            ],
            if (branding.showHighlights && chips.isNotEmpty) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                alignment: WrapAlignment.center,
                children: [
                  for (final c in chips)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 3),
                      decoration: BoxDecoration(
                        color: lightIntro ? Colors.white.withValues(alpha: 0.14) : primary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(999),
                        border: Border.all(color: lightIntro ? Colors.white24 : primary.withValues(alpha: 0.25)),
                      ),
                      child: Text(c.toUpperCase(), style: TextStyle(fontSize: 9.5, fontWeight: FontWeight.w700, color: lightIntro ? Colors.white : primary)),
                    ),
                ],
              ),
            ],
          ],
        ),
      );

      final pageBody = Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (showTopBanner)
            Stack(children: [heroBg(), introContent])
          else
            introContent,
          Transform.translate(
            offset: Offset(0, (centered && !isFullBg) ? -24 : 0),
            child: Padding(
              padding: EdgeInsets.fromLTRB(pad, (centered && !isFullBg) ? 0 : 8, pad, pad),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  loginCard(),
                  const SizedBox(height: 10),
                  footer(onDark: isFullBg),
                ],
              ),
            ),
          ),
        ],
      );

      return Container(
        color: surface,
        child: Stack(
          fit: mobile ? StackFit.passthrough : StackFit.expand,
          children: [
            if (isFullBg) fullBgLayer(),
            wrapDesktopClip(pageBody),
          ],
        ),
      );
    }

    // Split Showcase Layout
    if (mobile) {
      final cardNode = featureCard(centered: true);
      final bannerContent = Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                mark(36),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(companyName, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white), overflow: TextOverflow.ellipsis),
                      Text(tagline, style: const TextStyle(fontSize: 11, color: Colors.white70), overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
                topPills(),
              ],
            ),
            if (cardNode != null || hasHeroBody) ...[
              const SizedBox(height: 10),
              if (cardNode != null) Center(child: cardNode),
              if (hasHeroBody)
                HeroRichPreviewText(
                  text: branding.heroBody,
                  light: true,
                  compact: true,
                  accentColor: secondary,
                ),
            ],
          ],
        ),
      );

      return Container(
        color: surface,
        child: Stack(
          children: [
            if (isFullBg) fullBgLayer(),
            Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (isFullBg)
                  bannerContent
                else
                  Stack(children: [heroBg(), bannerContent]),
                Padding(
                  padding: const EdgeInsets.fromLTRB(12, 16, 12, 16),
                  child: Column(
                    children: [
                      loginCard(),
                      const SizedBox(height: 12),
                      footer(onDark: isFullBg),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    }

    final splitCardNode = featureCard();
    return Container(
      color: surface,
      child: Stack(
        fit: StackFit.expand,
        children: [
          if (isFullBg) fullBgLayer(),
          Row(
            children: [
              // Left hero showcase
              Expanded(
                flex: 46,
                child: Stack(
                  children: [
                    if (!isFullBg) heroBg(),
                    if (!isFullBg)
                      Positioned(
                        top: 0,
                        left: 0,
                        right: 0,
                        child: Container(height: 4, decoration: BoxDecoration(gradient: LinearGradient(colors: [primary, secondary]))),
                      ),
                    Padding(
                      padding: const EdgeInsets.all(28),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              mark(44),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(companyName, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, color: Colors.white), overflow: TextOverflow.ellipsis),
                                    Text(tagline, style: const TextStyle(fontSize: 12, color: Colors.white70), overflow: TextOverflow.ellipsis),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          Expanded(
                            child: Center(
                              child: SingleChildScrollView(
                                physics: const NeverScrollableScrollPhysics(),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    if (splitCardNode != null) splitCardNode,
                                    Text(tagline.toUpperCase(), style: const TextStyle(fontSize: 10.5, fontWeight: FontWeight.w700, letterSpacing: 1.5, color: Colors.white70)),
                                    const SizedBox(height: 8),
                                    Text(headline, style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Colors.white, height: 1.15)),
                                    if (hasHeroBody) ...[
                                      const SizedBox(height: 12),
                                      HeroRichPreviewText(
                                        text: branding.heroBody,
                                        light: true,
                                        accentColor: secondary,
                                      ),
                                    ],
                                    if (branding.showHighlights && chips.isNotEmpty) ...[
                                      const SizedBox(height: 14),
                                      Wrap(
                                        spacing: 6,
                                        runSpacing: 6,
                                        children: [
                                          for (final c in chips)
                                            Container(
                                              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                              decoration: BoxDecoration(
                                                color: Colors.white.withValues(alpha: 0.12),
                                                borderRadius: BorderRadius.circular(999),
                                                border: Border.all(color: Colors.white24),
                                              ),
                                              child: Text(c.toUpperCase(), style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                                            ),
                                        ],
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            ),
                          ),
                          const Divider(height: 1, color: Colors.white24),
                          const SizedBox(height: 12),
                          if (!branding.hidePoweredBy)
                            Text('${_tr('Powered by', 'Propulsé par')} Learn French with Natives', style: const TextStyle(fontSize: 11.5, color: Colors.white70, fontWeight: FontWeight.w600))
                          else
                            Row(
                              children: [
                                Container(width: 7, height: 7, decoration: const BoxDecoration(color: Color(0xFF34D399), shape: BoxShape.circle)),
                                const SizedBox(width: 7),
                                Text(_tr('$companyName Official Portal', 'Portail officiel $companyName'), style: const TextStyle(fontSize: 11.5, color: Colors.white70, fontWeight: FontWeight.w600)),
                              ],
                            ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              // Right form area
              Expanded(
                flex: 54,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 20),
                  child: Column(
                    children: [
                      Align(alignment: Alignment.centerRight, child: topPills()),
                      const Spacer(),
                      loginCard(),
                      const Spacer(),
                      footer(onDark: isFullBg),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _GridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.05)
      ..strokeWidth = 1;
    const step = 36.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
