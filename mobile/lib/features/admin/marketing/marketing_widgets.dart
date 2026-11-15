import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'marketing_model.dart';

/// The QR code of a campaign's link: dark squares on white, readable by any
/// phone camera, with enough correction to survive a print or a dim screen.
class CampaignQr extends StatelessWidget {
  final String url;
  final double size;
  final Color color;
  const CampaignQr({super.key, required this.url, required this.size, this.color = AppColors.ink});

  @override
  Widget build(BuildContext context) => QrImageView(
    data: url,
    size: size,
    padding: EdgeInsets.zero,
    backgroundColor: Colors.white,
    errorCorrectionLevel: QrErrorCorrectLevel.M,
    semanticsLabel: context.isFrench ? 'QR code de la campagne' : 'Campaign QR code',
    eyeStyle: QrEyeStyle(eyeShape: QrEyeShape.square, color: color),
    dataModuleStyle: QrDataModuleStyle(dataModuleShape: QrDataModuleShape.square, color: color),
  );
}

/// A picture of the site, or the campaign's colours while it loads or when
/// there is none (or no network).
class CampaignPicture extends StatelessWidget {
  final String? imageKey;
  final CampaignTheme theme;
  final double? height;
  final BoxFit fit;
  const CampaignPicture({super.key, required this.imageKey, required this.theme, this.height, this.fit = BoxFit.cover});

  @override
  Widget build(BuildContext context) {
    final fallback = Container(
      height: height,
      decoration: BoxDecoration(gradient: theme.gradient),
    );
    final key = imageKey;
    if (key == null || key.isEmpty) return fallback;
    return Image.network(
      campaignPictureUrl(key),
      height: height,
      width: double.infinity,
      fit: fit,
      gaplessPlayback: true,
      frameBuilder: (_, child, frame, sync) => frame == null && !sync ? fallback : child,
      errorBuilder: (_, _, _) => fallback,
    );
  }
}

/// The campaign as visitors see it on the site: its colours, picture, badge,
/// title, the facts that make people decide, the price and the button.
class CampaignPreview extends StatelessWidget {
  final Campaign campaign;
  final bool fr;
  const CampaignPreview({super.key, required this.campaign, required this.fr});

  @override
  Widget build(BuildContext context) {
    final c = campaign;
    final t = themeOf(c.theme);
    final badge = c.word('badge', fr) ?? kindLabel(c.kind, fr);
    final tagline = c.word('tagline', fr);
    final schedule = c.word('schedule', fr);
    final points = c.highlights(fr).take(3).toList();
    final cta = campaignCta(c, fr);
    final timeLeft = c.showCountdown ? campaignTimeLeft(c.endsAt, fr) : null;
    final onLight = AppTypography.caption.copyWith(color: Colors.white.withValues(alpha: 0.86), height: 1.35);

    return ClipRRect(
      borderRadius: BorderRadius.circular(18),
      child: DecoratedBox(
        decoration: BoxDecoration(gradient: t.gradient),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            SizedBox(
              height: 128,
              child: Stack(
                fit: StackFit.expand,
                children: [
                  CampaignPicture(imageKey: c.imageKey, theme: t),
                  DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [t.b.withValues(alpha: 0.05), t.a.withValues(alpha: 0.55), t.a],
                        stops: const [0, 0.65, 1],
                      ),
                    ),
                  ),
                  Positioned(
                    left: 14,
                    top: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: t.accent, borderRadius: BorderRadius.circular(999)),
                      child: Text(
                        badge.toUpperCase(),
                        style: AppTypography.caption.copyWith(color: t.b, fontWeight: FontWeight.w900, letterSpacing: 0.6, fontSize: 10.5),
                      ),
                    ),
                  ),
                  if (timeLeft != null)
                    Positioned(
                      right: 12,
                      top: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(color: Colors.black.withValues(alpha: 0.38), borderRadius: BorderRadius.circular(999)),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.timer_outlined, size: 13, color: Colors.white),
                            const SizedBox(width: 4),
                            Text(
                              timeLeft,
                              style: AppTypography.caption.copyWith(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 11),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    c.title(fr),
                    style: AppTypography.titleMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w900, height: 1.2),
                  ),
                  if (tagline != null) ...[const SizedBox(height: 4), Text(tagline, style: onLight.copyWith(fontSize: 13))],
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 12,
                    runSpacing: 6,
                    children: [
                      if (c.classStartsOn != null)
                        _fact(
                          Icons.event_outlined,
                          fr
                              ? 'Début le ${DateFormat('d MMM yyyy', 'fr_FR').format(c.classStartsOn!)}'
                              : 'Starts ${DateFormat('d MMM yyyy', 'en_US').format(c.classStartsOn!)}',
                          onLight,
                        ),
                      if (schedule != null) _fact(Icons.schedule, schedule, onLight),
                      if (c.teacher != null) _fact(Icons.person_outline, c.teacher!, onLight),
                      if (campaignSeatsLine(c, fr) case final seats?) _fact(Icons.event_seat_outlined, seats, onLight),
                    ],
                  ),
                  // The bar of the site: it fills as the group does.
                  if (c.seatLimit != null && c.showSeats && !c.full) ...[
                    const SizedBox(height: 8),
                    ClipRRect(
                      key: const Key('campaign-preview-seats-bar'),
                      borderRadius: BorderRadius.circular(99),
                      child: LinearProgressIndicator(
                        value: c.seatsRatio,
                        minHeight: 5,
                        backgroundColor: Colors.white.withValues(alpha: 0.2),
                        valueColor: AlwaysStoppedAnimation(t.accent),
                      ),
                    ),
                  ],
                  if (points.isNotEmpty) ...[
                    const SizedBox(height: 10),
                    for (final p in points)
                      Padding(
                        padding: const EdgeInsets.only(bottom: 3),
                        child: Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Padding(
                              padding: const EdgeInsets.only(top: 1),
                              child: Icon(Icons.check_circle, size: 14, color: t.accent),
                            ),
                            const SizedBox(width: 6),
                            Expanded(child: Text(p, style: onLight)),
                          ],
                        ),
                      ),
                  ],
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 12,
                    runSpacing: 10,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    alignment: WrapAlignment.spaceBetween,
                    children: [
                      if (c.hasPrice) _price(c, t),
                      if (cta != null)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                          decoration: BoxDecoration(color: t.accent, borderRadius: BorderRadius.circular(10)),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Flexible(
                                child: Text(
                                  cta,
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                  style: AppTypography.bodySmall.copyWith(color: t.b, fontWeight: FontWeight.w800),
                                ),
                              ),
                              const SizedBox(width: 6),
                              Icon(Icons.arrow_forward, size: 16, color: t.b),
                            ],
                          ),
                        ),
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

  Widget _fact(IconData icon, String text, TextStyle style) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 14, color: Colors.white.withValues(alpha: 0.9)),
      const SizedBox(width: 4),
      Flexible(
        child: Text(text, style: style.copyWith(fontWeight: FontWeight.w600)),
      ),
    ],
  );

  Widget _price(Campaign c, CampaignTheme t) {
    final promo = c.pricePromo;
    final regular = c.priceRegular;
    final note = c.word('price_note', fr);
    final main = promo ?? regular!;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              main == 0 ? (fr ? 'Gratuit' : 'Free') : campaignMoney(main, c.currency, fr),
              style: AppTypography.titleMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w900),
            ),
            if (promo != null && regular != null && regular > promo) ...[
              const SizedBox(width: 8),
              Text(
                campaignMoney(regular, c.currency, fr),
                style: AppTypography.caption.copyWith(
                  color: Colors.white.withValues(alpha: 0.7),
                  decoration: TextDecoration.lineThrough,
                  decorationColor: Colors.white.withValues(alpha: 0.7),
                ),
              ),
            ],
          ],
        ),
        if (note != null) Text(note, style: AppTypography.caption.copyWith(color: Colors.white.withValues(alpha: 0.75), fontSize: 11)),
      ],
    );
  }
}

/// A coloured message across the panel: what the state of a campaign means.
class MarketingBanner extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String text;
  const MarketingBanner({super.key, required this.icon, required this.color, required this.title, required this.text});

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 12),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: color.withValues(alpha: 0.07),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: color.withValues(alpha: 0.3)),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: color),
              ),
              const SizedBox(height: 2),
              Text(text, style: AppTypography.caption.copyWith(color: AppColors.text, height: 1.4)),
            ],
          ),
        ),
      ],
    ),
  );
}

/// What the admin sees until migration 026 has run on the server.
class MarketingNotInstalled extends StatelessWidget {
  final VoidCallback onRetry;
  const MarketingNotInstalled({super.key, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return Column(
      children: [
        AdminEmpty(
          icon: Icons.build_circle_outlined,
          title: fr ? 'Le marketing n’est pas encore installé' : 'Marketing is not installed yet',
          message: fr
              ? 'Le serveur n’a pas encore les tables des campagnes. Lancez backend/database/run-promotions-migration.js sur le serveur, puis réessayez.'
              : 'The server does not have the campaign tables yet. Run backend/database/run-promotions-migration.js on the server, then try again.',
        ),
        const SizedBox(height: 8),
        AdminButton(fr ? 'Réessayer' : 'Try again', icon: Icons.refresh, primary: false, onPressed: onRetry),
      ],
    );
  }
}

/// A white box around a group of lines.
class MarketingBox extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  const MarketingBox({super.key, required this.child, this.padding = const EdgeInsets.symmetric(horizontal: 14, vertical: 10)});

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: padding,
    decoration: BoxDecoration(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: AppColors.border),
    ),
    child: child,
  );
}
