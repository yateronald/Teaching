import 'dart:async';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';

/// The AI writer of the campaign editor: the administrator describes the
/// campaign in their own words; the AI fills every field in French and in
/// English (POST /admin/promotions/ai/draft), then makes a picture
/// (POST /admin/promotions/ai/image). Nothing is saved: the form and the
/// preview show the result, to check before saving.

/// The writer can take up to a minute (and the picture another 15 s or so).
final _aiOptions = Options(receiveTimeout: const Duration(seconds: 150), sendTimeout: const Duration(seconds: 30));

const _aiGradient = LinearGradient(colors: [Color(0xFF4F46E5), Color(0xFFA855F7), Color(0xFFF59E0B)], begin: Alignment.topLeft, end: Alignment.bottomRight);

/// The AI mark: a gradient tile with sparkles.
class AiMark extends StatelessWidget {
  final double size;
  const AiMark({super.key, this.size = 34});

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        decoration: BoxDecoration(gradient: _aiGradient, borderRadius: BorderRadius.circular(size * 0.3)),
        child: Icon(Icons.auto_awesome, color: Colors.white, size: size * 0.55),
      );
}

/// The zone the AI reads the dates in: the profile's, or the phone's offset.
String aiTimeZone(WidgetRef ref) {
  final profile = ref.read(authNotifierProvider).user?.timezone?.trim() ?? '';
  if (profile.contains('/') || profile == 'UTC') return profile;
  final offset = DateTime.now().timeZoneOffset;
  if (offset.inMinutes % 60 != 0 || offset.inHours == 0) return 'UTC';
  final h = offset.inHours;
  return 'Etc/GMT${h > 0 ? '-' : '+'}${h.abs()}';
}

class CampaignAiCard extends ConsumerStatefulWidget {
  /// True for an existing campaign: the AI changes it instead of writing it.
  final bool editing;

  /// The form as the API takes it, sent when it already has content.
  final Map<String, dynamic> Function() current;

  /// Whether the form already has a title (then the AI changes it).
  final bool hasContent;

  /// The AI wrote the campaign: fill the form (fields as the API gives them).
  final void Function(Map<String, dynamic> fields, String imagePrompt) onDraft;

  /// The AI made a picture.
  final ValueChanged<String> onPicture;

  /// Puts the form back as it was before the AI wrote (null when there is nothing to undo).
  final VoidCallback? onUndo;

  const CampaignAiCard({
    super.key,
    required this.editing,
    required this.current,
    required this.hasContent,
    required this.onDraft,
    required this.onPicture,
    this.onUndo,
  });

  @override
  ConsumerState<CampaignAiCard> createState() => _CampaignAiCardState();
}

class _CampaignAiCardState extends ConsumerState<CampaignAiCard> {
  final _brief = TextEditingController();
  late bool _open = !widget.editing;
  bool _picture = true;
  String _phase = 'idle'; // idle | writing | drawing
  int _seconds = 0;
  Timer? _clock;
  String? _error;
  Map<String, dynamic>? _status;
  Map<String, dynamic>? _draft;
  String? _pictureWarning;
  String? _pictureError;

  @override
  void initState() {
    super.initState();
    _brief.addListener(() => setState(() {}));
    _loadStatus();
  }

  @override
  void dispose() {
    _clock?.cancel();
    _brief.dispose();
    super.dispose();
  }

  Future<void> _loadStatus() async {
    try {
      final res = await ref.read(apiClientProvider).get('/admin/promotions/ai');
      if (mounted) setState(() => _status = J.map(res.data));
    } catch (_) {
      // Unknown: the card stays usable and says what went wrong if it fails.
    }
  }

  void _setPhase(String phase) {
    _clock?.cancel();
    setState(() {
      _phase = phase;
      _seconds = 0;
    });
    if (phase != 'idle') {
      _clock = Timer.periodic(const Duration(seconds: 1), (_) {
        if (mounted) setState(() => _seconds++);
      });
    }
  }

  Future<void> _run() async {
    final fr = context.isFrench;
    final api = ref.read(apiClientProvider);
    setState(() {
      _error = null;
      _draft = null;
      _pictureWarning = null;
      _pictureError = null;
    });
    _setPhase('writing');
    try {
      final res = await api.post(
        '/admin/promotions/ai/draft',
        data: {
          'brief': _brief.text,
          if (widget.editing || widget.hasContent) 'current': widget.current(),
          'timezone': aiTimeZone(ref),
          'notes_lang': fr ? 'fr' : 'en',
        },
        options: _aiOptions,
      );
      if (!mounted) return;
      final draft = J.map(res.data);
      final fields = J.map(draft['fields']);
      widget.onDraft(fields, J.s(draft['image_prompt']));
      setState(() => _draft = draft);
      if (_picture) {
        _setPhase('drawing');
        try {
          final pic = await api.post(
            '/admin/promotions/ai/image',
            data: {
              'prompt': J.s(draft['image_prompt']),
              'theme': J.s(fields['theme']),
              'title': J.s(fields['title_en']).isNotEmpty ? J.s(fields['title_en']) : J.s(fields['title_fr']),
            },
            options: _aiOptions,
          );
          if (!mounted) return;
          final p = J.map(pic.data);
          widget.onPicture(J.s(p['image_key']));
          setState(() => _pictureWarning = J.s(p['warning']).isEmpty ? null : J.s(p['warning']));
        } catch (e) {
          if (mounted) setState(() => _pictureError = apiErrorText(context, e));
        }
      }
    } catch (e) {
      if (mounted) setState(() => _error = apiErrorText(context, e));
    } finally {
      if (mounted) _setPhase('idle');
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final busy = _phase != 'idle';
    final changing = widget.editing || widget.hasContent;
    final off = _status != null && _status!['available'] == false;

    if (!_open) {
      return Padding(
        padding: const EdgeInsets.only(bottom: 14),
        child: Material(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.circular(14),
          child: InkWell(
            key: const Key('campaign-ai-open'),
            borderRadius: BorderRadius.circular(14),
            onTap: () => setState(() => _open = true),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: const Color(0xFFDDD6FE), width: 1.5)),
              child: Row(
                children: [
                  const AiMark(),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(widget.editing ? (fr ? 'Modifier avec l’IA' : 'Change it with AI') : (fr ? 'Créer avec l’IA' : 'Create it with AI'),
                            style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                        Text(
                          fr ? 'Décrivez la campagne : l’IA l’écrit en français et en anglais, avec une image.' : 'Describe it: the AI writes it in French and English, with a picture.',
                          style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    final model = _status == null || _status!['available'] != true
        ? null
        : '${J.s(_status!['writing_model'])} · ${J.s(_status!['engine']) == 'vertex' ? 'Vertex AI' : 'Gemini API'}';
    final notes = _draft == null ? const <String>[] : [for (final n in (_draft!['notes'] is List ? _draft!['notes'] as List : const [])) '$n'];

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(1.6),
      decoration: BoxDecoration(gradient: _aiGradient, borderRadius: BorderRadius.circular(16)),
      child: Container(
        padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
        decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(14.5)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Row(
              children: [
                const AiMark(),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.editing ? (fr ? 'Modifier avec l’IA' : 'Change it with AI') : (fr ? 'Créer la campagne avec l’IA' : 'Create the campaign with AI'),
                        style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink),
                      ),
                      if (model != null) Text(model, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
                    ],
                  ),
                ),
                IconButton(
                  tooltip: fr ? 'Replier' : 'Close',
                  icon: const Icon(Icons.expand_less, color: AppColors.textMuted),
                  onPressed: busy ? null : () => setState(() => _open = false),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (off)
              Text(
                fr
                    ? 'Le moteur d’IA n’est pas configuré sur le serveur (Admin → Moteur d’IA). Remplissez le formulaire à la main.'
                    : 'The AI engine is not configured on the server (Admin → AI engine). Fill the form by hand.',
                style: AppTypography.bodySmall.copyWith(color: AppColors.warn),
              )
            else ...[
              TextField(
                key: const Key('campaign-ai-brief'),
                controller: _brief,
                enabled: !busy,
                minLines: 4,
                maxLines: 9,
                maxLength: 4000,
                style: AppTypography.bodyMedium,
                decoration: adminInputDecoration(
                  fr ? 'Votre description' : 'Your description',
                  hint: changing
                      ? (fr ? 'Ce qui change : « plus urgent, il reste 3 places », « ajouter un groupe le samedi »…' : 'What should change: “more urgent, 3 seats left”, “add a Saturday group”…')
                      : (fr
                          ? 'En français ou en anglais : ce que c’est, pour qui, dates et horaires, prix (et réduction), nombre de places, le professeur, la date limite… L’IA n’utilise que ce que vous donnez et dit ce qui manque.'
                          : 'In French or English: what it is, for whom, dates and times, price (and discount), seats, the teacher, the deadline… The AI only uses the facts you give and says what is missing.'),
                ),
              ),
              Row(
                children: [
                  Switch.adaptive(value: _picture, onChanged: busy ? null : (v) => setState(() => _picture = v), activeTrackColor: AppColors.adminAccent),
                  const SizedBox(width: 6),
                  Expanded(child: Text(fr ? 'Créer aussi une image' : 'Also create a picture', style: AppTypography.bodySmall)),
                ],
              ),
              const SizedBox(height: 6),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                alignment: WrapAlignment.end,
                children: [
                  if (widget.onUndo != null && _draft != null && !busy)
                    AdminButton(fr ? 'Annuler' : 'Undo', icon: Icons.undo, primary: false, onPressed: () {
                      widget.onUndo!();
                      setState(() => _draft = null);
                    }),
                  AdminButton(
                    busy ? (fr ? 'L’IA travaille…' : 'Working…') : (changing ? (fr ? 'Appliquer' : 'Apply the changes') : (fr ? 'Écrire la campagne' : 'Write the campaign')),
                    key: const Key('campaign-ai-go'),
                    icon: Icons.auto_awesome,
                    busy: busy,
                    onPressed: busy || _brief.text.trim().length < 8 ? null : _run,
                  ),
                ],
              ),
              if (busy) ...[
                const SizedBox(height: 10),
                _Step(
                  done: _phase == 'drawing',
                  active: _phase == 'writing',
                  text: fr
                      ? 'Rédaction en français et en anglais${_phase == 'writing' ? ' · $_seconds s (jusqu’à une minute)' : ''}'
                      : 'Writing in French and English${_phase == 'writing' ? ' · $_seconds s (up to a minute)' : ''}',
                ),
                if (_picture)
                  _Step(
                    done: false,
                    active: _phase == 'drawing',
                    text: fr ? 'Création et vérification de l’image${_phase == 'drawing' ? ' · $_seconds s' : ''}' : 'Creating and checking the picture${_phase == 'drawing' ? ' · $_seconds s' : ''}',
                  ),
              ],
              if (_error != null) ...[
                const SizedBox(height: 10),
                Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.bad)),
              ],
              if (_draft != null && !busy) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: AppColors.surfaceSoft, borderRadius: BorderRadius.circular(12)),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fr
                            ? 'Écrite par ${J.s(_draft!['model'])}. Le formulaire et l’aperçu sont remplis : relisez, corrigez si besoin, puis enregistrez.'
                            : 'Written by ${J.s(_draft!['model'])}. The form and the preview are filled: read them, correct what is needed, then save.',
                        style: AppTypography.caption.copyWith(color: AppColors.good, fontWeight: FontWeight.w700, height: 1.4),
                      ),
                      if (_pictureWarning != null) ...[
                        const SizedBox(height: 6),
                        Text('${fr ? 'Image' : 'Picture'} : $_pictureWarning', style: AppTypography.caption.copyWith(color: AppColors.warn, height: 1.4)),
                      ],
                      if (_pictureError != null) ...[
                        const SizedBox(height: 6),
                        Text(
                          fr ? 'Pas de nouvelle image : $_pictureError Une photo de la bibliothèque est utilisée en attendant.' : 'No new picture: $_pictureError A library photo is used meanwhile.',
                          style: AppTypography.caption.copyWith(color: AppColors.warn, height: 1.4),
                        ),
                      ],
                      if (notes.isNotEmpty) ...[
                        const SizedBox(height: 10),
                        Text(fr ? 'À VÉRIFIER AVANT DE PUBLIER' : 'TO CHECK BEFORE PUBLISHING',
                            style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.textSubtle, fontSize: 10.5, letterSpacing: 0.6)),
                        const SizedBox(height: 4),
                        for (final n in notes)
                          Padding(
                            padding: const EdgeInsets.only(top: 3),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text('•  '),
                                Expanded(child: Text(n, style: AppTypography.caption.copyWith(color: AppColors.ink, height: 1.4))),
                              ],
                            ),
                          ),
                      ],
                    ],
                  ),
                ),
              ],
            ],
          ],
        ),
      ),
    );
  }
}

class _Step extends StatelessWidget {
  final bool done;
  final bool active;
  final String text;
  const _Step({required this.done, required this.active, required this.text});

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 6),
        child: Row(
          children: [
            SizedBox(
              width: 18,
              height: 18,
              child: done
                  ? const Icon(Icons.check_circle, size: 18, color: AppColors.good)
                  : active
                      ? const CircularProgressIndicator(strokeWidth: 2, color: AppColors.adminAccent)
                      : const Icon(Icons.image_outlined, size: 18, color: AppColors.textSubtle),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(text,
                  style: AppTypography.caption.copyWith(color: done ? AppColors.good : (active ? AppColors.adminAccent : AppColors.textMuted), fontWeight: active ? FontWeight.w700 : FontWeight.w500)),
            ),
          ],
        ),
      );
}

/// A new picture for the campaign, from a description (the Look section).
class AiPictureMaker extends ConsumerStatefulWidget {
  final String prompt;
  final String theme;
  final String? title;
  final ValueChanged<String> onPicture;
  const AiPictureMaker({super.key, required this.prompt, required this.theme, required this.title, required this.onPicture});

  @override
  ConsumerState<AiPictureMaker> createState() => _AiPictureMakerState();
}

class _AiPictureMakerState extends ConsumerState<AiPictureMaker> {
  late final _prompt = TextEditingController(text: widget.prompt);
  bool _open = false;
  bool _busy = false;
  String? _note;
  bool _bad = false;

  @override
  void initState() {
    super.initState();
    _prompt.addListener(() => setState(() {}));
  }

  @override
  void didUpdateWidget(covariant AiPictureMaker old) {
    super.didUpdateWidget(old);
    if (old.prompt != widget.prompt && !_busy) _prompt.text = widget.prompt;
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
            '/admin/promotions/ai/image',
            data: {'prompt': _prompt.text, 'theme': widget.theme, 'title': widget.title},
            options: _aiOptions,
          );
      if (!mounted) return;
      final p = J.map(res.data);
      widget.onPicture(J.s(p['image_key']));
      setState(() {
        _note = J.s(p['warning']).isEmpty ? null : J.s(p['warning']);
        _bad = false;
        if (_note == null) _open = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _note = apiErrorText(context, e);
          _bad = true;
        });
      }
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (!_open) {
      return AdminButton(fr ? 'Nouvelle image avec l’IA' : 'New picture with AI', key: const Key('campaign-ai-picture'), icon: Icons.auto_awesome, primary: false, onPressed: () => setState(() => _open = true));
    }
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: const Color(0xFFFAF5FF), borderRadius: BorderRadius.circular(12), border: Border.all(color: const Color(0xFFDDD6FE))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          TextField(
            controller: _prompt,
            enabled: !_busy,
            minLines: 2,
            maxLines: 5,
            maxLength: 900,
            style: AppTypography.bodySmall,
            decoration: adminInputDecoration(
              fr ? 'Ce que montre l’image' : 'What the picture shows',
              hint: fr ? 'Qui, où, en train de faire quoi, l’ambiance. Aucun texte n’est jamais dessiné.' : 'Who, where, doing what, the mood. No text is ever drawn.',
            ),
          ),
          Text(fr ? 'Environ 15 secondes. L’image est vérifiée (texte, logos).' : 'About 15 seconds. The picture is checked for text and logos.',
              style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            alignment: WrapAlignment.end,
            children: [
              AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: _busy ? null : () => setState(() => _open = false)),
              AdminButton(fr ? 'Créer l’image' : 'Create the picture', icon: Icons.auto_awesome, busy: _busy, onPressed: _busy || _prompt.text.trim().length < 12 ? null : _make),
            ],
          ),
          if (_note != null) ...[
            const SizedBox(height: 8),
            Text(_note!, style: AppTypography.caption.copyWith(color: _bad ? AppColors.bad : AppColors.warn, height: 1.4)),
          ],
        ],
      ),
    );
  }
}
