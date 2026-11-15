import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../marketing/campaign_ai.dart' show AiMark;
import '../marketing/marketing_model.dart' show campaignPictures, themeOf;
import '../marketing/marketing_widgets.dart' show CampaignPicture;
import 'email_model.dart';

/// The picture of an email: made by the marketing painter from a description
/// (same image model, same checks for text and logos) or taken from the
/// library; at the top (large) or under the headline; removed.
class EmailPictureSection extends ConsumerStatefulWidget {
  final String? imageKey;
  final Map<String, dynamic> design;
  final Map<String, dynamic> meta;
  final String? title;
  /// The description last used (by the AI writer or by hand).
  final String prompt;
  final void Function(String? key, String prompt) onPicture;
  final ValueChanged<String> onPlace;

  const EmailPictureSection({
    super.key,
    required this.imageKey,
    required this.design,
    required this.meta,
    required this.title,
    required this.prompt,
    required this.onPicture,
    required this.onPlace,
  });

  @override
  ConsumerState<EmailPictureSection> createState() => _EmailPictureSectionState();
}

class _EmailPictureSectionState extends ConsumerState<EmailPictureSection> {
  late final _prompt = TextEditingController(text: widget.prompt);
  bool _busy = false;
  String? _note;
  bool _noteBad = false;

  @override
  void didUpdateWidget(EmailPictureSection old) {
    super.didUpdateWidget(old);
    if (old.prompt != widget.prompt && widget.prompt != _prompt.text) _prompt.text = widget.prompt;
  }

  @override
  void dispose() {
    _prompt.dispose();
    super.dispose();
  }

  Future<void> _make() async {
    setState(() {
      _busy = true;
      _note = null;
    });
    try {
      final res = await ref.read(apiClientProvider).post(
        '/admin/email-campaigns/ai/image',
        data: {'prompt': _prompt.text.trim(), 'theme': J.s(widget.design['theme']), 'title': widget.title},
      );
      final p = J.map(res.data);
      widget.onPicture(J.s(p['image_key']), _prompt.text.trim());
      if (mounted && J.s(p['warning']).isNotEmpty) {
        setState(() {
          _note = J.s(p['warning']);
          _noteBad = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _note = emailErrorText(context, e);
          _noteBad = true;
        });
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _library() async {
    final key = await showAdminPanel<String>(context, tabletWidth: 620, builder: (_) => _LibraryPanel(selected: widget.imageKey));
    if (key != null && mounted) widget.onPicture(key, _prompt.text.trim());
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final key = widget.imageKey;
    final painter = J.s(J.map(widget.meta['ai'])['image_model']);
    final place = pictureOf(widget.design);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        ClipRRect(
          borderRadius: BorderRadius.circular(12),
          child: key == null
              ? Container(
                  height: 90,
                  color: AppColors.border.withValues(alpha: 0.4),
                  alignment: Alignment.center,
                  child: Text(fr ? 'Pas d’image' : 'No picture', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                )
              : CampaignPicture(key: Key('email-picture-$key'), imageKey: key, theme: themeOf(J.s(widget.design['theme'])), height: 150),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            for (final (p, label) in [('top', fr ? 'En haut, en grand' : 'At the top, large'), ('inline', fr ? 'Sous le titre' : 'Under the headline')])
              ChoiceChip(
                key: Key('email-picture-place-$p'),
                label: Text(label),
                selected: place == p,
                visualDensity: VisualDensity.compact,
                onSelected: (_) => widget.onPlace(p),
              ),
            ActionChip(key: const Key('email-picture-library'), avatar: const Icon(Icons.photo_library_outlined, size: 16), label: Text(fr ? 'Bibliothèque' : 'Library'), visualDensity: VisualDensity.compact, onPressed: _library),
            if (key != null)
              ActionChip(
                key: const Key('email-picture-remove'),
                avatar: const Icon(Icons.delete_outline, size: 16, color: AppColors.bad),
                label: Text(fr ? 'Retirer' : 'Remove'),
                visualDensity: VisualDensity.compact,
                onPressed: () => widget.onPicture(null, _prompt.text.trim()),
              ),
          ],
        ),
        const SizedBox(height: 10),
        TextField(
          key: const Key('email-picture-prompt'),
          controller: _prompt,
          enabled: !_busy,
          minLines: 2,
          maxLines: 5,
          onChanged: (_) => setState(() {}),
          style: AppTypography.bodyMedium,
          decoration: adminInputDecoration(
            fr ? 'Décrivez l’image' : 'Describe the picture',
            hint: fr ? 'Qui, où, en train de faire quoi, l’ambiance. Aucun texte n’est dessiné.' : 'Who, where, doing what, the mood. No text is ever drawn.',
          ),
        ),
        const SizedBox(height: 6),
        Text(
          fr
              ? '${painter.isEmpty ? 'Le peintre du marketing' : '$painter (le peintre du marketing)'} · environ 15 s · vérifiée (texte, logos)'
              : '${painter.isEmpty ? 'The marketing painter' : '$painter (the marketing painter)'} · about 15 s · checked for text and logos',
          style: AppTypography.caption.copyWith(color: AppColors.textMuted),
        ),
        Align(
          alignment: Alignment.centerRight,
          child: FilledButton.icon(
            key: const Key('email-picture-make'),
            onPressed: _busy || _prompt.text.trim().length < 12 ? null : _make,
            style: FilledButton.styleFrom(backgroundColor: const Color(0xFF6D4AFF)),
            icon: _busy ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const AiMark(size: 18),
            label: Text(
              _busy ? (fr ? 'Création… (environ 15 s)' : 'Drawing… (about 15 s)') : (key?.startsWith('ai-') ?? false) ? (fr ? 'Une autre image' : 'Another picture') : (fr ? 'Créer l’image' : 'Create the picture'),
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ),
        if (_note != null) Padding(padding: const EdgeInsets.only(top: 6), child: Text(_note!, style: AppTypography.caption.copyWith(color: _noteBad ? AppColors.bad : AppColors.warn))),
      ],
    );
  }
}

/// The site's photos, by theme: tap one to use it.
class _LibraryPanel extends StatelessWidget {
  final String? selected;
  const _LibraryPanel({required this.selected});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return AdminPanel(
      title: fr ? 'Bibliothèque d’images' : 'Picture library',
      children: [
        for (final (en, frName, keys) in campaignPictures) ...[
          PanelSection(fr ? frName : en),
          GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: MediaQuery.sizeOf(context).width > 560 ? 4 : 3,
            mainAxisSpacing: 6,
            crossAxisSpacing: 6,
            childAspectRatio: 16 / 10,
            children: [
              for (final k in keys)
                InkWell(
                  key: Key('email-library-$k'),
                  onTap: () => Navigator.of(context).pop(k),
                  borderRadius: BorderRadius.circular(8),
                  child: Container(
                    clipBehavior: Clip.antiAlias,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: k == selected ? AppColors.adminAccent : Colors.transparent, width: 2),
                    ),
                    child: CampaignPicture(imageKey: k, theme: themeOf('navy')),
                  ),
                ),
            ],
          ),
        ],
      ],
    );
  }
}
