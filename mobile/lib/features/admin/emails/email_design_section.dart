import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../marketing/campaign_ai.dart' show AiMark;
import '../marketing/marketing_model.dart' show campaignThemes;
import 'email_model.dart';

/// The art director can take a while.
final _aiOptions = Options(receiveTimeout: const Duration(seconds: 150), sendTimeout: const Duration(seconds: 30));

/// The look of the email: the AI's art director proposes three complete
/// designs (following email UI/UX rules); a layout and a palette in one tap;
/// then every detail (header, logo, alignment, fonts, sizes, corners, buttons,
/// key points, card). The server keeps every colour readable.
class EmailDesignSection extends ConsumerStatefulWidget {
  final Map<String, dynamic> design;
  final Map<String, dynamic> meta;

  /// The email as the API takes it, for the art director to read.
  final Map<String, dynamic> Function() email;
  final ValueChanged<Map<String, dynamic>> onDesign;
  /// The writer the administrator picked (Vertex), or null for the usual order.
  final String? model;
  /// The models with what each just did (a refused pick shows at once).
  final ValueChanged<List<Map<String, dynamic>>>? onChoices;

  const EmailDesignSection({super.key, required this.design, required this.meta, required this.email, required this.onDesign, this.model, this.onChoices});

  @override
  ConsumerState<EmailDesignSection> createState() => _EmailDesignSectionState();
}

class _EmailDesignSectionState extends ConsumerState<EmailDesignSection> {
  String _style = 'professional';
  String _color = 'brand';
  String _header = 'auto';
  final _wishes = TextEditingController();
  bool _busy = false;
  String? _error;
  String? _notice;
  List<Map<String, dynamic>> _proposals = [];
  Map<String, dynamic>? _before;

  Map<String, dynamic> get _d => widget.design;

  @override
  void dispose() {
    _wishes.dispose();
    super.dispose();
  }

  void _set(String key, dynamic value) => widget.onDesign({...designCopy(_d), key: value});

  void _apply(Map<String, dynamic> next) {
    _before ??= designCopy(_d);
    widget.onDesign(designCopy(next));
  }

  Future<void> _propose() async {
    final lang = context.isFrench ? 'fr' : 'en';
    setState(() {
      _busy = true;
      _error = null;
      _notice = null;
      _proposals = [];
    });
    try {
      final res = await ref
          .read(apiClientProvider)
          .post(
            '/admin/email-campaigns/ai/designs',
            data: {
              'campaign': widget.email(),
              'wishes': {'style': _style, 'color': _color == 'brand' ? 'navy' : _color, 'header': _header == 'auto' ? null : _header, 'notes': _wishes.text.trim()},
              'model': widget.model,
              'lang': lang,
            },
            options: _aiOptions,
          );
      if (!mounted) return;
      final data = J.map(res.data);
      final choices = modelChoices(data['choices']);
      if (choices.isNotEmpty) widget.onChoices?.call(choices);
      setState(() {
        _proposals = J.list(data, ['designs']).map(designCopy).toList();
        _notice = J.s(data['notice']).isEmpty ? null : J.s(data['notice']);
      });
    } catch (e) {
      if (mounted) setState(() => _error = apiErrorText(context, e));
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  bool _same(Map<String, dynamic> a, Map<String, dynamic> b) =>
      a['preset'] == b['preset'] &&
      a['header'] == b['header'] &&
      a['font'] == b['font'] &&
      J.map(a['colors'])['primary'] == J.map(b['colors'])['primary'] &&
      J.map(a['colors'])['header_bg'] == J.map(b['colors'])['header_bg'];

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final presets = J.map(J.map(widget.meta['design'])['presets']);
    final aiAvailable = J.map(widget.meta['ai'])['available'] == true;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              width: 120,
              child: EmailSketch(design: _d, key: const Key('email-design-current')),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    J.s(_d[fr ? 'name_fr' : 'name_en']).isNotEmpty ? J.s(_d[fr ? 'name_fr' : 'name_en']) : presetLabel(J.s(_d['preset']), fr),
                    style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${headerLabel(J.s(_d['header']), fr)} · ${fontLabel(J.s(_d['heading_font']))} · ${fr ? 'boutons' : 'buttons'} ${J.s(_d['button_shape'])}',
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  ),
                  if (_before != null)
                    TextButton.icon(
                      key: const Key('email-design-undo'),
                      onPressed: () {
                        widget.onDesign(_before!);
                        setState(() => _before = null);
                      },
                      icon: const Icon(Icons.undo, size: 18),
                      label: Text(fr ? 'Design précédent' : 'Previous design'),
                    ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),

        // The art director.
        AdminCard(
          title: fr ? 'Directeur artistique IA' : 'AI art director',
          icon: Icons.palette_outlined,
          accent: const Color(0xFF6D4AFF),
          child: !aiAvailable
              ? Text(fr ? 'Le moteur d’IA n’est pas configuré sur le serveur.' : 'The AI engine is not configured on the server.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))
              : Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Text(
                      fr
                          ? 'Trois designs professionnels pour cet email, selon les règles UI/UX de l’email : hiérarchie, contraste, un bouton clair.'
                          : 'Three professional designs for this email, following email UI/UX rules: hierarchy, contrast, one clear button.',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.4),
                    ),
                    _label(fr ? 'Ambiance' : 'Mood'),
                    _chips<String>([for (final s in emailDesignStyles) (s, designStyleLabel(s, fr), null)], _style, _busy ? null : (v) => setState(() => _style = v), keyPrefix: 'email-style'),
                    _label(fr ? 'Couleurs' : 'Colours'),
                    _chips<String>(
                      [('brand', fr ? 'Couleurs de l’école' : 'The school’s colours', null), for (final t in campaignThemes) (t.id, fr ? t.fr : t.en, t.a)],
                      _color,
                      _busy ? null : (v) => setState(() => _color = v),
                      keyPrefix: 'email-color',
                    ),
                    _label(fr ? 'En-tête' : 'Header'),
                    _chips<String>(
                      [
                        for (final h in ['auto', 'band', 'hero', 'logo', 'centered']) (h, headerLabel(h, fr), null),
                      ],
                      _header,
                      _busy ? null : (v) => setState(() => _header = v),
                      keyPrefix: 'email-header-wish',
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _wishes,
                      enabled: !_busy,
                      maxLines: 2,
                      style: AppTypography.bodyMedium,
                      decoration: adminInputDecoration(
                        fr ? 'Autre chose ? (facultatif)' : 'Anything else? (optional)',
                        hint: fr ? 'ex. plus premium, moins de texte dans l’en-tête' : 'e.g. more premium, less text in the header',
                      ),
                    ),
                    const SizedBox(height: 10),
                    Align(
                      alignment: Alignment.centerRight,
                      child: FilledButton.icon(
                        key: const Key('email-design-go'),
                        onPressed: _busy ? null : _propose,
                        style: FilledButton.styleFrom(backgroundColor: const Color(0xFF6D4AFF)),
                        icon: _busy ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const AiMark(size: 18),
                        label: Text(
                          _busy
                              ? (fr ? 'Création… (environ 15 s)' : 'Designing… (about 15 s)')
                              : _proposals.isEmpty
                              ? (fr ? 'Proposer trois designs' : 'Propose three designs')
                              : (fr ? 'Trois autres designs' : 'Three other designs'),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    if (_error != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(_error!, style: AppTypography.caption.copyWith(color: AppColors.bad)),
                      ),
                    if (_notice != null)
                      Padding(
                        key: const Key('email-design-notice'),
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(_notice!, style: AppTypography.caption.copyWith(color: AppColors.warn)),
                      ),
                    for (var i = 0; i < _proposals.length; i++) _proposal(fr, i),
                  ],
                ),
        ),

        // A layout and a palette in one tap.
        _label(fr ? 'Mise en page' : 'Layout'),
        _chips<String>(
          [for (final p in emailPresets) (p, presetLabel(p, fr), null)],
          J.s(_d['preset']),
          presets.isEmpty ? null : (p) => _apply(recolorDesign(designCopy(presets[p]), J.s(_d['theme']).isEmpty ? 'navy' : J.s(_d['theme']), widget.meta)),
          keyPrefix: 'email-preset',
        ),
        _label(fr ? 'Palette' : 'Palette'),
        _chips<String>([for (final t in campaignThemes) (t.id, fr ? t.fr : t.en, t.a)], J.s(_d['theme']), (t) => _apply(recolorDesign(_d, t, widget.meta)), keyPrefix: 'email-theme'),
        const SizedBox(height: 6),

        // Every detail.
        Theme(
          data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
          child: ExpansionTile(
            key: const Key('email-design-details'),
            tilePadding: EdgeInsets.zero,
            childrenPadding: const EdgeInsets.only(bottom: 8),
            expandedCrossAxisAlignment: CrossAxisAlignment.stretch,
            title: Text(
              fr ? 'Régler chaque détail' : 'Adjust every detail',
              style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
            ),
            children: [
              _label(fr ? 'En-tête' : 'Header'),
              _chips<String>([for (final h in emailHeaders) (h, headerLabel(h, fr), null)], J.s(_d['header']), (v) => _set('header', v), keyPrefix: 'email-header'),
              _label('Logo'),
              _chips<String>(
                [('top', fr ? 'Au-dessus' : 'Above', null), ('header', fr ? 'Dans l’en-tête' : 'In the header', null), ('none', fr ? 'Masqué' : 'Hidden', null)],
                J.s(_d['logo']),
                (v) => _set('logo', v),
              ),
              _label(fr ? 'Alignement' : 'Alignment'),
              _chips<String>([('left', fr ? 'À gauche' : 'Left', null), ('center', fr ? 'Centré' : 'Centred', null)], J.s(_d['align']), (v) => _set('align', v)),
              _label(fr ? 'Police du texte' : 'Text font'),
              _chips<String>([for (final f in emailFonts) (f, fontLabel(f), null)], J.s(_d['font']), (v) => _set('font', v)),
              _label(fr ? 'Police des titres' : 'Headline font'),
              _chips<String>([for (final f in emailFonts) (f, fontLabel(f), null)], J.s(_d['heading_font']), (v) => _set('heading_font', v), keyPrefix: 'email-heading-font'),
              _slider(fr ? 'Taille du titre' : 'Headline size', 'heading_size', 22, 38),
              _slider(fr ? 'Taille du texte' : 'Text size', 'body_size', 14, 18),
              _slider(fr ? 'Coins' : 'Corners', 'radius', 0, 28),
              _label(fr ? 'Espacement' : 'Spacing'),
              _chips<String>([('compact', fr ? 'Serré' : 'Compact', null), ('normal', 'Normal', null), ('airy', fr ? 'Aéré' : 'Airy', null)], J.s(_d['spacing']), (v) => _set('spacing', v)),
              _label(fr ? 'Boutons' : 'Buttons'),
              _chips<String>(
                [('rounded', fr ? 'Arrondis' : 'Rounded', null), ('pill', fr ? 'Pilule' : 'Pill', null), ('square', fr ? 'Carrés' : 'Square', null)],
                J.s(_d['button_shape']),
                (v) => _set('button_shape', v),
                keyPrefix: 'email-button-shape',
              ),
              _chips<String>([('auto', fr ? 'Largeur ajustée' : 'Fitted width', null), ('full', fr ? 'Pleine largeur' : 'Full width', null)], J.s(_d['button_width']), (v) => _set('button_width', v)),
              _label(fr ? 'Points clés' : 'Key points'),
              _chips<String>(
                [('checks', fr ? 'Coches' : 'Ticks', null), ('cards', fr ? 'Cartes' : 'Cards', null), ('numbers', fr ? 'Numéros' : 'Numbers', null)],
                J.s(_d['points']),
                (v) => _set('points', v),
              ),
              _label(fr ? 'Carte' : 'Card'),
              _chips<String>([('shadow', fr ? 'Ombre' : 'Shadow', null), ('border', fr ? 'Bordure' : 'Border', null), ('flat', fr ? 'Plate' : 'Flat', null)], J.s(_d['card']), (v) => _set('card', v)),
              const SizedBox(height: 6),
              Text(
                fr
                    ? 'Les couleurs restent lisibles automatiquement (contraste ≥ 4,5:1). Chaque couleur se règle aussi une à une sur le site web.'
                    : 'Colours are kept readable automatically (contrast ≥ 4.5:1). Each colour can also be set one by one on the website.',
                style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.4),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _proposal(bool fr, int i) {
    final p = _proposals[i];
    final on = _same(p, _d);
    return Container(
      key: Key('email-proposal-$i'),
      margin: const EdgeInsets.only(top: 12),
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: on ? const Color(0xFF6D4AFF) : AppColors.border, width: on ? 2 : 1),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(width: 96, child: EmailSketch(design: p)),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  J.s(p[fr ? 'name_fr' : 'name_en']).isNotEmpty ? J.s(p[fr ? 'name_fr' : 'name_en']) : 'Design ${i + 1}',
                  style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink),
                ),
                const SizedBox(height: 2),
                Text(
                  J.s(p[fr ? 'rationale_fr' : 'rationale_en']),
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.35),
                ),
                const SizedBox(height: 2),
                Text(
                  '${presetLabel(J.s(p['preset']), fr)} · ${headerLabel(J.s(p['header']), fr)} · ${fontLabel(J.s(p['heading_font']))}',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11),
                ),
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton.icon(
                    key: Key('email-proposal-use-$i'),
                    onPressed: on ? null : () => _apply(p),
                    icon: Icon(on ? Icons.check : Icons.brush_outlined, size: 18),
                    label: Text(on ? (fr ? 'Utilisé' : 'In use') : (fr ? 'Utiliser ce design' : 'Use this design')),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _label(String text) => Padding(
    padding: const EdgeInsets.only(top: 10, bottom: 6),
    child: Text(
      text,
      style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w800),
    ),
  );

  Widget _chips<T>(List<(T, String, Color?)> options, T selected, ValueChanged<T>? onSelected, {String? keyPrefix}) => Wrap(
    spacing: 6,
    runSpacing: 6,
    children: [
      for (final (value, label, color) in options)
        ChoiceChip(
          key: keyPrefix == null ? null : Key('$keyPrefix-$value'),
          avatar: color == null ? null : CircleAvatar(backgroundColor: color, radius: 8),
          label: Text(label),
          selected: selected == value,
          visualDensity: VisualDensity.compact,
          onSelected: onSelected == null ? null : (_) => onSelected(value),
        ),
    ],
  );

  Widget _slider(String label, String key, double min, double max) {
    final v = J.n(_d[key]).toDouble().clamp(min, max);
    return Row(
      children: [
        SizedBox(
          width: 110,
          child: Text('$label · ${v.round()} px', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
        ),
        Expanded(
          child: Slider(value: v, min: min, max: max, divisions: (max - min).round(), activeColor: AppColors.adminAccent, onChanged: (n) => _set(key, n.round())),
        ),
      ],
    );
  }
}

/// A design drawn small: the page, the header, the headline, a few lines and
/// the button, in the design's colours and shapes.
class EmailSketch extends StatelessWidget {
  final Map<String, dynamic> design;
  const EmailSketch({super.key, required this.design});

  @override
  Widget build(BuildContext context) {
    final d = design;
    Color c(String k, Color f) => designColor(d, k, f);
    final header = J.s(d['header']);
    final centred = d['align'] == 'center' || header == 'centered';
    final radius = (J.n(d['radius']).toDouble() / 3).clamp(0.0, 9.0);
    final button = switch (J.s(d['button_shape'])) {
      'pill' => 99.0,
      'square' => 0.0,
      _ => 4.0,
    };
    Widget line(double w, Color color, {double h = 4}) => Container(
      width: w,
      height: h,
      margin: const EdgeInsets.only(top: 4),
      decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2)),
    );
    final banded = header == 'band' || header == 'hero';
    // Drawn at one size, then scaled to the room it has (it never overflows).
    return AspectRatio(
      aspectRatio: 0.78,
      child: FittedBox(child: SizedBox(width: 120, height: 154, child: _sketch(d, c, header, centred, radius, button, line, banded))),
    );
  }

  Widget _sketch(Map<String, dynamic> d, Color Function(String, Color) c, String header, bool centred, double radius, double button, Widget Function(double, Color, {double h}) line, bool banded) {
    return Container(
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: c('page_bg', const Color(0xFFF2F4F7)),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Container(
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: c('card_bg', Colors.white),
          borderRadius: BorderRadius.circular(radius),
          border: d['card'] == 'border' ? Border.all(color: c('soft', AppColors.border)) : null,
          boxShadow: d['card'] == 'shadow' ? [BoxShadow(color: Colors.black.withValues(alpha: 0.12), blurRadius: 4, offset: const Offset(0, 1))] : null,
        ),
        child: Column(
          crossAxisAlignment: centred ? CrossAxisAlignment.center : CrossAxisAlignment.start,
          children: [
            if (banded)
              Container(
                height: header == 'hero' ? 34 : 24,
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 5),
                decoration: BoxDecoration(
                  color: c('header_bg', AppColors.adminAccent),
                  gradient: header == 'hero'
                      ? LinearGradient(
                          colors: [c('header_bg', AppColors.adminAccent).withValues(alpha: 0.55), c('header_bg', AppColors.adminAccent)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        )
                      : null,
                ),
                alignment: centred ? Alignment.bottomCenter : Alignment.bottomLeft,
                child: Container(
                  width: 40,
                  height: 5,
                  decoration: BoxDecoration(color: c('header_text', Colors.white), borderRadius: BorderRadius.circular(2)),
                ),
              )
            else if (header != 'none')
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Container(
                  width: 22,
                  height: 6,
                  decoration: BoxDecoration(color: c('primary', AppColors.adminAccent), borderRadius: BorderRadius.circular(2)),
                ),
              ),
            Expanded(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(6, 4, 6, 6),
                child: Column(
                  crossAxisAlignment: centred ? CrossAxisAlignment.center : CrossAxisAlignment.start,
                  children: [
                    line(48, c('heading', AppColors.ink), h: 6),
                    line(60, c('muted', AppColors.textMuted).withValues(alpha: 0.45)),
                    line(52, c('muted', AppColors.textMuted).withValues(alpha: 0.45)),
                    line(40, c('muted', AppColors.textMuted).withValues(alpha: 0.45)),
                    const Spacer(),
                    Container(
                      width: d['button_width'] == 'full' ? double.infinity : 38,
                      height: 10,
                      decoration: BoxDecoration(color: c('primary', AppColors.adminAccent), borderRadius: BorderRadius.circular(button)),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
