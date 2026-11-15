import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'campaign_flyer.dart';
import 'marketing_model.dart';
import 'marketing_widgets.dart';

/// Everything to spread a campaign from the phone: its link (it opens the
/// campaign directly on the site), a message ready to paste in WhatsApp or on
/// social networks, and a picture for posts and stories.
class CampaignSharePanel extends StatefulWidget {
  final Campaign campaign;
  const CampaignSharePanel({super.key, required this.campaign});

  @override
  State<CampaignSharePanel> createState() => _CampaignSharePanelState();
}

class _CampaignSharePanelState extends State<CampaignSharePanel> {
  bool? _fr;

  void _copy(String text, String done) {
    Clipboard.setData(ClipboardData(text: text));
    adminToast(context, done);
  }

  Future<void> _launch(Uri uri) async {
    final failed = context.isFrench ? 'Impossible d’ouvrir ce lien.' : 'Could not open this link.';
    try {
      if (await launchUrl(uri, mode: LaunchMode.externalApplication)) return;
    } catch (_) {}
    if (mounted) adminToast(context, failed, error: true);
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final c = widget.campaign;
    final lang = _fr ?? fr;
    final url = campaignUrl(c.slug, fr: lang);
    final message = campaignMessage(c, fr: lang);

    return AdminPanel(
      title: fr ? 'Partager la campagne' : 'Share the campaign',
      subtitle: c.title(fr),
      children: [
        if (c.state == 'scheduled')
          MarketingBanner(
            icon: Icons.schedule,
            color: const Color(0xFF2563EB),
            title: fr ? 'Pas encore en ligne' : 'Not online yet',
            text: fr
                ? 'Le lien ouvrira la campagne à partir du ${AdminFmt.dateTime(context, c.startsAt)}. Avant, il mène à la page des offres.'
                : 'The link opens the campaign from ${AdminFmt.dateTime(context, c.startsAt)}. Before that, it leads to the offers page.',
          )
        else if (!c.isLive)
          MarketingBanner(
            icon: Icons.visibility_off_outlined,
            color: AppColors.warn,
            title: fr ? 'Elle n’est pas sur le site' : 'It is not on the site',
            text: fr
                ? 'Publiez-la avant de partager : sinon le lien annonce que l’offre n’est plus disponible.'
                : 'Publish it before sharing: otherwise the link says the offer is no longer available.',
          ),
        Row(
          children: [
            Expanded(
              child: Text(
                fr ? 'Langue de la page et du message' : 'Language of the page and message',
                style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
              ),
            ),
            SegmentedButton<bool>(
              segments: const [
                ButtonSegment(value: true, label: Text('FR')),
                ButtonSegment(value: false, label: Text('EN')),
              ],
              selected: {lang},
              showSelectedIcon: false,
              style: const ButtonStyle(visualDensity: VisualDensity.compact, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
              onSelectionChanged: (s) => setState(() => _fr = s.first),
            ),
          ],
        ),
        PanelSection(fr ? 'Lien de la campagne' : 'Campaign link'),
        MarketingBox(
          child: SelectableText(
            url,
            key: const Key('share-url'),
            style: AppTypography.bodySmall.copyWith(color: AppColors.adminAccent, fontWeight: FontWeight.w600),
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            AdminButton(
              fr ? 'Copier le lien' : 'Copy the link',
              key: const Key('share-copy-link'),
              icon: Icons.link,
              onPressed: () => _copy(url, fr ? 'Lien copié' : 'Link copied'),
            ),
            AdminButton(fr ? 'Ouvrir' : 'Open', icon: Icons.open_in_new, primary: false, onPressed: () => _launch(Uri.parse(url))),
          ],
        ),
        PanelSection(fr ? 'QR code à montrer' : 'QR code to show'),
        MarketingBox(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                key: const Key('share-qr'),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.border),
                ),
                child: CampaignQr(url: url, size: 132, color: themeOf(c.theme).b),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Text(
                  fr
                      ? 'À un salon, en classe ou en rendez-vous : la personne scanne l’écran avec son téléphone et arrive directement sur l’inscription.'
                      : 'At a fair, in class or in a meeting: the person scans the screen with their phone and lands right on the registration.',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.45),
                ),
              ),
            ],
          ),
        ),
        PanelSection(fr ? 'Message prêt à envoyer' : 'Message ready to send'),
        MarketingBox(
          child: SelectableText(message, style: AppTypography.bodySmall.copyWith(color: AppColors.ink, height: 1.5)),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            AdminButton(
              fr ? 'Copier le message' : 'Copy the message',
              icon: Icons.copy_all_outlined,
              onPressed: () => _copy(message, fr ? 'Message copié' : 'Message copied'),
            ),
            AdminButton(
              fr ? 'Envoyer sur WhatsApp' : 'Send on WhatsApp',
              icon: Icons.chat_outlined,
              primary: false,
              onPressed: () => _launch(Uri.parse('https://wa.me/?text=${Uri.encodeComponent(message)}')),
            ),
          ],
        ),
        PanelSection(fr ? 'Visuel pour les réseaux' : 'Picture for social networks'),
        Text(
          fr
              ? 'Une image aux couleurs de la campagne, avec son QR code, pour une publication ou une story Instagram, Facebook, WhatsApp, ou à imprimer.'
              : 'A picture in the campaign’s colours, with its QR code, for an Instagram, Facebook or WhatsApp post or story, or to print.',
          style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 8),
        AdminButton(
          fr ? 'Créer le visuel' : 'Make the picture',
          key: const Key('share-flyer'),
          icon: Icons.image_outlined,
          primary: false,
          onPressed: () => showAdminPanel(
            context,
            tabletWidth: 560,
            builder: (_) => CampaignFlyerPanel(campaign: c, fr: lang),
          ),
        ),
      ],
    );
  }
}

/// A message about the campaign, in one language, ending with its link.
String campaignMessage(Campaign c, {required bool fr}) {
  final locale = fr ? 'fr_FR' : 'en_US';
  String day(DateTime d) => DateFormat(d.year == DateTime.now().year ? 'd MMMM' : 'd MMMM yyyy', locale).format(d);
  final emoji = switch (c.kind) {
    'offer' => '🎁',
    'event' => '🎉',
    'announcement' => '📣',
    _ => '🎓',
  };
  final tagline = c.word('tagline', fr);
  final schedule = c.word('schedule', fr);
  final lines = <String>[
    '$emoji ${c.title(fr)}',
    ?tagline,
    '',
    if (c.classStartsOn != null || schedule != null)
      '📅 ${[if (c.classStartsOn != null) fr ? 'Début le ${day(c.classStartsOn!)}' : 'Starts ${day(c.classStartsOn!)}', ?schedule].join(' · ')}',
    if (c.teacher != null) fr ? '👩‍🏫 Avec ${c.teacher}' : '👩‍🏫 With ${c.teacher}',
    for (final h in c.highlights(fr).take(3)) '✔️ $h',
    if (campaignSeatsLine(c, fr) case final seats?) '👥 $seats',
    if (c.hasPrice) '💶 ${_price(c, fr)}',
    if (c.endsAt != null) fr ? '⏳ Jusqu’au ${day(c.endsAt!)}' : '⏳ Until ${day(c.endsAt!)}',
    '',
    '👉 ${campaignUrl(c.slug, fr: fr)}',
  ];
  // No empty line twice in a row, nor one right after the title block when nothing follows.
  final out = <String>[];
  for (final l in lines) {
    if (l.isEmpty && (out.isEmpty || out.last.isEmpty)) continue;
    out.add(l);
  }
  return out.join('\n');
}

String _price(Campaign c, bool fr) {
  final promo = c.pricePromo;
  final regular = c.priceRegular;
  final main = promo ?? regular!;
  final note = c.word('price_note', fr);
  final text = main == 0 ? (fr ? 'Gratuit' : 'Free') : campaignMoney(main, c.currency, fr);
  final before = promo != null && regular != null && regular > promo
      ? (fr ? ' au lieu de ${campaignMoney(regular, c.currency, fr)}' : ' instead of ${campaignMoney(regular, c.currency, fr)}')
      : '';
  return '$text$before${note != null ? ' ($note)' : ''}';
}
