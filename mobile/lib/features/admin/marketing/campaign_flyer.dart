import 'dart:io';
import 'dart:ui' as ui;
import 'package:file_picker/file_picker.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'marketing_model.dart';
import 'marketing_widgets.dart';

/// The sizes of a picture for social networks, drawn 360 points wide and
/// saved 1080 pixels wide.
enum FlyerFormat {
  square(360, 360, 'Post (1:1)', 'Publication (1:1)'),
  portrait(360, 450, 'Post (4:5)', 'Publication (4:5)'),
  story(360, 640, 'Story (9:16)', 'Story (9:16)');

  final double width;
  final double height;
  final String en;
  final String fr;
  const FlyerFormat(this.width, this.height, this.en, this.fr);

  Size get size => Size(width, height);
  String label(bool fr) => fr ? this.fr : en;
}

/// Chooses a format and a language, shows the picture and saves it as a PNG.
class CampaignFlyerPanel extends StatefulWidget {
  final Campaign campaign;
  final bool fr;
  const CampaignFlyerPanel({super.key, required this.campaign, required this.fr});

  @override
  State<CampaignFlyerPanel> createState() => _CampaignFlyerPanelState();
}

class _CampaignFlyerPanelState extends State<CampaignFlyerPanel> {
  final _boundary = GlobalKey();
  FlyerFormat _format = FlyerFormat.square;
  late bool _fr = widget.fr;
  bool _qr = true;
  bool _saving = false;

  Future<void> _save() async {
    final fr = context.isFrench;
    setState(() => _saving = true);
    try {
      final box = _boundary.currentContext?.findRenderObject() as RenderRepaintBoundary?;
      if (box == null) return;
      final image = await box.toImage(pixelRatio: 1080 / _format.width);
      final data = await image.toByteData(format: ui.ImageByteFormat.png);
      image.dispose();
      if (data == null) throw StateError('no image');
      final bytes = data.buffer.asUint8List();
      final name = '${widget.campaign.slug}-${_format.name}-${_fr ? 'fr' : 'en'}.png';
      final path = await FilePicker.platform.saveFile(
        dialogTitle: fr ? 'Enregistrer le visuel' : 'Save the picture',
        fileName: name,
        type: FileType.image,
        bytes: bytes,
      );
      // On a computer the dialog only gives a path: the file is written here.
      if (!kIsWeb && path != null && !(Platform.isAndroid || Platform.isIOS)) await File(path).writeAsBytes(bytes);
      if (!mounted) return;
      if (path != null || kIsWeb) adminToast(context, fr ? 'Visuel enregistré : $name' : 'Picture saved: $name');
    } catch (_) {
      if (mounted) adminToast(context, fr ? 'Le visuel n’a pas pu être enregistré.' : 'The picture could not be saved.', error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final f = _format;
    return AdminPanel(
      title: fr ? 'Visuel de la campagne' : 'Campaign picture',
      subtitle: widget.campaign.title(fr),
      actions: [
        AdminButton(fr ? 'Fermer' : 'Close', primary: false, onPressed: _saving ? null : () => Navigator.of(context).pop()),
        AdminButton(
          fr ? 'Enregistrer l’image' : 'Save the image',
          key: const Key('flyer-save'),
          icon: Icons.download_outlined,
          busy: _saving,
          onPressed: _save,
        ),
      ],
      children: [
        AdminFilterChips<FlyerFormat>(
          options: [for (final x in FlyerFormat.values) FilterOption(x, x.label(fr))],
          selected: f,
          onSelected: (v) => setState(() => _format = v),
        ),
        const SizedBox(height: 8),
        Row(
          children: [
            Expanded(
              child: Text(
                fr ? 'Langue du visuel' : 'Language of the picture',
                style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
              ),
            ),
            SegmentedButton<bool>(
              segments: const [
                ButtonSegment(value: true, label: Text('FR')),
                ButtonSegment(value: false, label: Text('EN')),
              ],
              selected: {_fr},
              showSelectedIcon: false,
              style: const ButtonStyle(visualDensity: VisualDensity.compact, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
              onSelectionChanged: (s) => setState(() => _fr = s.first),
            ),
          ],
        ),
        SwitchListTile.adaptive(
          key: const Key('flyer-qr'),
          contentPadding: EdgeInsets.zero,
          dense: true,
          value: _qr,
          onChanged: (v) => setState(() => _qr = v),
          activeTrackColor: AppColors.adminAccent,
          secondary: Icon(Icons.qr_code_2, color: _qr ? AppColors.adminAccent : AppColors.textSubtle),
          title: Text(
            fr ? 'QR code vers l’inscription' : 'QR code to register',
            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
          ),
          subtitle: Text(
            fr ? 'Indispensable sur une affiche ou un écran ; facultatif dans une publication.' : 'A must on a poster or a screen; optional in a post.',
            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
          ),
        ),
        const SizedBox(height: 8),
        Center(
          child: ConstrainedBox(
            // A story stays a comfortable size on a phone; the saved file is full size.
            constraints: BoxConstraints(maxWidth: 360, maxHeight: f == FlyerFormat.story ? 520 : 450),
            child: AspectRatio(
              aspectRatio: f.width / f.height,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.15), blurRadius: 18, offset: const Offset(0, 6))],
                ),
                child: FittedBox(
                  child: RepaintBoundary(
                    key: _boundary,
                    child: CampaignFlyer(campaign: widget.campaign, fr: _fr, format: f, showQr: _qr),
                  ),
                ),
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        Text(
          fr
              ? 'Enregistré en 1080 px de large. Le QR code ouvre la campagne ; dans une publication, mettez aussi le lien dans la légende (bouton « Copier le message »).'
              : 'Saved 1080 px wide. The QR code opens the campaign; in a post, also put the link in the caption (“Copy the message” button).',
          style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.4),
        ),
      ],
    );
  }
}

/// The picture itself, drawn at its format's size in points.
class CampaignFlyer extends StatelessWidget {
  final Campaign campaign;
  final bool fr;
  final FlyerFormat format;

  /// A QR code that opens the campaign: for paper and screens (a post's caption carries the link).
  final bool showQr;
  const CampaignFlyer({super.key, required this.campaign, required this.fr, required this.format, this.showQr = true});

  TextStyle _small(Color color, FontWeight weight) => AppTypography.caption.copyWith(color: color, fontSize: 10.5, fontWeight: weight);

  Widget _siteLine(String site, Color white, Color soft) => Row(
    children: [
      Icon(Icons.language, size: 12, color: soft),
      const SizedBox(width: 4),
      Expanded(
        child: Text(site, maxLines: 1, overflow: TextOverflow.ellipsis, style: _small(white, FontWeight.w700)),
      ),
    ],
  );

  @override
  Widget build(BuildContext context) {
    final c = campaign;
    final t = themeOf(c.theme);
    final tall = format == FlyerFormat.story;
    final hasPicture = c.imageKey != null;
    final pictureShare = tall ? 0.46 : (format == FlyerFormat.portrait ? 0.48 : 0.5);
    final title = c.title(fr);
    final titleSize = title.length <= 26 ? (tall ? 34.0 : 30.0) : (title.length <= 48 ? (tall ? 29.0 : 25.0) : (tall ? 24.0 : 21.0));
    final square = format == FlyerFormat.square;
    // A square with a picture keeps it visible: fewer lines of text.
    final tagline = square && hasPicture ? null : c.word('tagline', fr);
    final schedule = c.word('schedule', fr);
    final cta = campaignCta(c, fr) ?? (fr ? 'En savoir plus' : 'Learn more');
    final points = c.highlights(fr).take(tall ? 3 : (format == FlyerFormat.portrait ? 2 : 0)).toList();
    // The site, short enough to read at a glance (the full link goes in the caption).
    final site = Uri.parse(ApiEndpoints.siteUrl).host.replaceFirst('www.', '');
    // Dates in the picture's language, whatever the language of the app.
    String day(DateTime d) => DateFormat(d.year == DateTime.now().year ? 'd MMM' : 'd MMM yyyy', fr ? 'fr_FR' : 'en_US').format(d);
    final until = c.endsAt;
    final deadline = until != null && c.showCountdown ? (fr ? 'Jusqu’au ${day(until)}' : 'Until ${day(until)}') : null;
    final white = Colors.white;
    final soft = Colors.white.withValues(alpha: 0.86);

    final facts = <(IconData, String)>[
      if (c.classStartsOn != null) (Icons.event, fr ? 'Début le ${day(c.classStartsOn!)}' : 'Starts ${day(c.classStartsOn!)}'),
      if (schedule != null) (Icons.schedule, schedule),
      if (c.seatLimit != null && c.showSeats)
        (Icons.event_seat, c.full ? (fr ? 'Liste d’attente' : 'Waiting list') : (fr ? 'Limité à ${c.seatLimit} places' : 'Limited to ${c.seatLimit} seats')),
    ].take(square && hasPicture ? 2 : 3).toList();

    return SizedBox(
      width: format.width,
      height: format.height,
      child: ClipRect(
        child: Stack(
          fit: StackFit.expand,
          children: [
            DecoratedBox(decoration: BoxDecoration(gradient: t.gradient)),
            if (hasPicture)
              Positioned(
                left: 0,
                right: 0,
                top: 0,
                height: format.height * pictureShare + 40,
                child: _FlyerPicture(imageKey: c.imageKey!),
              ),
            // Veils keep the brand readable on top and fade the picture into the colours.
            DecoratedBox(
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: hasPicture
                      ? [t.b.withValues(alpha: 0.6), t.b.withValues(alpha: 0.05), t.a.withValues(alpha: 0.75), t.a, t.b]
                      : [Colors.transparent, Colors.transparent, Colors.transparent, t.a.withValues(alpha: 0.2), t.b.withValues(alpha: 0.4)],
                  stops: [0, 0.2, pictureShare - 0.04, pictureShare + 0.1, 1],
                ),
              ),
            ),
            if (!hasPicture)
              Positioned(
                right: -60,
                top: -40,
                child: Container(
                  width: 220,
                  height: 220,
                  decoration: BoxDecoration(shape: BoxShape.circle, color: t.accent.withValues(alpha: 0.13)),
                ),
              ),
            Padding(
              padding: EdgeInsets.all(tall ? 26 : 22),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Flexible(
                        child: Container(
                          padding: const EdgeInsets.fromLTRB(4, 4, 10, 4),
                          decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.95), borderRadius: BorderRadius.circular(999)),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              ClipOval(
                                child: Image.asset(
                                  'assets/images/logo_mark.png',
                                  width: 20,
                                  height: 20,
                                  fit: BoxFit.cover,
                                  errorBuilder: (_, _, _) => const SizedBox(width: 20),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Flexible(
                                child: Text(
                                  'Learn French with Natives',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppTypography.caption.copyWith(color: AppColors.frenchNavy, fontWeight: FontWeight.w800, fontSize: 10.5),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Container(
                        constraints: BoxConstraints(maxWidth: format.width * 0.42),
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                        decoration: BoxDecoration(color: t.accent, borderRadius: BorderRadius.circular(999)),
                        child: Text(
                          (c.word('badge', fr) ?? kindLabel(c.kind, fr)).toUpperCase(),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: AppTypography.caption.copyWith(color: t.b, fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 0.6),
                        ),
                      ),
                    ],
                  ),
                  // The words take the room left, scaled down as a whole when a long title would not fit.
                  Expanded(
                    child: Align(
                      alignment: Alignment.bottomLeft,
                      child: FittedBox(
                        fit: BoxFit.scaleDown,
                        alignment: Alignment.bottomLeft,
                        child: SizedBox(
                          width: format.width - (tall ? 52 : 44),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text(
                                title,
                                style: TextStyle(
                                  fontFamily: AppTypography.bodyMedium.fontFamily,
                                  color: white,
                                  fontSize: titleSize,
                                  fontWeight: FontWeight.w900,
                                  height: 1.08,
                                ),
                              ),
                              if (tagline != null) ...[
                                const SizedBox(height: 8),
                                Text(
                                  tagline,
                                  style: AppTypography.bodySmall.copyWith(color: soft, fontSize: tall ? 15 : 13, height: 1.35),
                                ),
                              ],
                              if (facts.isNotEmpty) ...[
                                SizedBox(height: tall ? 16 : 12),
                                Wrap(
                                  spacing: 12,
                                  runSpacing: 6,
                                  children: [
                                    for (final (icon, text) in facts)
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: [
                                          Icon(icon, size: 14, color: t.accent),
                                          const SizedBox(width: 5),
                                          Flexible(
                                            child: Text(
                                              text,
                                              style: AppTypography.caption.copyWith(color: white, fontWeight: FontWeight.w700, fontSize: tall ? 13 : 12),
                                            ),
                                          ),
                                        ],
                                      ),
                                  ],
                                ),
                              ],
                              if (points.isNotEmpty) ...[
                                SizedBox(height: tall ? 14 : 10),
                                for (final p in points)
                                  Padding(
                                    padding: const EdgeInsets.only(bottom: 4),
                                    child: Row(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Icon(Icons.check_circle, size: 14, color: t.accent),
                                        const SizedBox(width: 6),
                                        Expanded(
                                          child: Text(
                                            p,
                                            style: AppTypography.caption.copyWith(color: soft, fontSize: tall ? 13 : 12, height: 1.3),
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                              ],
                              if (c.hasPrice) ...[SizedBox(height: tall ? 16 : 12), _FlyerPrice(campaign: c, fr: fr, theme: t, big: tall)],
                            ],
                          ),
                        ),
                      ),
                    ),
                  ),
                  SizedBox(height: tall ? 22 : 14),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.stretch,
                          children: [
                            Container(
                              padding: EdgeInsets.symmetric(horizontal: 14, vertical: tall ? 13 : 10),
                              decoration: BoxDecoration(color: t.accent, borderRadius: BorderRadius.circular(12)),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Flexible(
                                    child: Text(
                                      cta,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: AppTypography.bodySmall.copyWith(color: t.b, fontWeight: FontWeight.w900, fontSize: tall ? 15 : 13),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Icon(Icons.arrow_forward, size: 17, color: t.b),
                                ],
                              ),
                            ),
                            const SizedBox(height: 8),
                            // Where to register, and until when: one line, or two beside the QR code.
                            if (showQr) ...[
                              _siteLine(site, white, soft),
                              if (deadline != null) ...[
                                const SizedBox(height: 3),
                                Text(deadline, maxLines: 1, overflow: TextOverflow.ellipsis, style: _small(t.accent, FontWeight.w800)),
                              ],
                            ] else
                              Row(
                                children: [
                                  Expanded(child: _siteLine(site, white, soft)),
                                  if (deadline != null) ...[
                                    const SizedBox(width: 8),
                                    Flexible(
                                      child: Text(
                                        deadline,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        textAlign: TextAlign.end,
                                        style: _small(t.accent, FontWeight.w800),
                                      ),
                                    ),
                                  ],
                                ],
                              ),
                          ],
                        ),
                      ),
                      if (showQr) ...[
                        const SizedBox(width: 12),
                        _FlyerQr(
                          url: campaignUrl(c.slug, fr: fr),
                          theme: t,
                          size: tall ? 88 : 70,
                          label: fr ? 'Scannez pour\nvous inscrire' : 'Scan to\nregister',
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// A white card with the QR code of the campaign and what to do with it.
class _FlyerQr extends StatelessWidget {
  final String url;
  final CampaignTheme theme;
  final double size;
  final String label;
  const _FlyerQr({required this.url, required this.theme, required this.size, required this.label});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.fromLTRB(6, 6, 6, 5),
    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(10)),
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        CampaignQr(url: url, size: size, color: theme.b),
        const SizedBox(height: 4),
        SizedBox(
          width: size,
          child: Text(
            label,
            textAlign: TextAlign.center,
            maxLines: 2,
            style: AppTypography.caption.copyWith(color: theme.b, fontSize: size > 70 ? 9.5 : 8.5, fontWeight: FontWeight.w800, height: 1.15),
          ),
        ),
      ],
    ),
  );
}

class _FlyerPicture extends StatelessWidget {
  final String imageKey;
  const _FlyerPicture({required this.imageKey});

  @override
  Widget build(BuildContext context) => Image.network(
    // The large picture: the file is saved at three times this size.
    campaignPictureUrl(imageKey, large: true),
    fit: BoxFit.cover,
    gaplessPlayback: true,
    errorBuilder: (_, _, _) => const SizedBox.shrink(),
  );
}

class _FlyerPrice extends StatelessWidget {
  final Campaign campaign;
  final bool fr;
  final CampaignTheme theme;
  final bool big;
  const _FlyerPrice({required this.campaign, required this.fr, required this.theme, required this.big});

  @override
  Widget build(BuildContext context) {
    final c = campaign;
    final promo = c.pricePromo;
    final regular = c.priceRegular;
    final main = promo ?? regular!;
    final note = c.word('price_note', fr);
    return Wrap(
      crossAxisAlignment: WrapCrossAlignment.end,
      spacing: 10,
      runSpacing: 4,
      children: [
        Text(
          main == 0 ? (fr ? 'Gratuit' : 'Free') : campaignMoney(main, c.currency, fr),
          style: TextStyle(
            fontFamily: AppTypography.bodyMedium.fontFamily,
            color: theme.accent,
            fontSize: big ? 32 : 26,
            fontWeight: FontWeight.w900,
            height: 1,
          ),
        ),
        if (promo != null && regular != null && regular > promo)
          Padding(
            padding: const EdgeInsets.only(bottom: 3),
            child: Text(
              campaignMoney(regular, c.currency, fr),
              style: AppTypography.bodySmall.copyWith(
                color: Colors.white.withValues(alpha: 0.7),
                decoration: TextDecoration.lineThrough,
                decorationColor: Colors.white.withValues(alpha: 0.7),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        if (note != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 3),
            child: Text(
              note,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.caption.copyWith(color: Colors.white.withValues(alpha: 0.8), fontSize: 11),
            ),
          ),
      ],
    );
  }
}
