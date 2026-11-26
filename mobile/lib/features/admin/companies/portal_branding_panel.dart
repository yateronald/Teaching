import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'company_model.dart';
import 'hero_rich_field.dart';
import 'portal_login_preview.dart';

/// Full Portal Branding Studio in Mobile Admin: live WYSIWYG preview, logo &
/// cover uploads, color presets, layout templates, copy, links, and white-label
/// controls. Pops `true` when any change was persisted.
class PortalBrandingPanel extends ConsumerStatefulWidget {
  final Company company;
  const PortalBrandingPanel({super.key, required this.company});

  @override
  ConsumerState<PortalBrandingPanel> createState() => _PortalBrandingPanelState();
}

class _PortalBrandingPanelState extends ConsumerState<PortalBrandingPanel> {
  static const _maxLogoBytes = 1024 * 1024;
  static const _maxCoverBytes = 2 * 1024 * 1024;
  static const _imgExts = ['png', 'jpg', 'jpeg', 'webp'];

  late PortalBranding _initial = widget.company.branding;
  late PortalBranding _draft = widget.company.branding;
  late final TextEditingController _displayName = TextEditingController(text: widget.company.shownName);
  late final TextEditingController _slug = TextEditingController(text: widget.company.slug);
  late final TextEditingController _primaryHex = TextEditingController(text: widget.company.branding.primaryColor);
  late final TextEditingController _secondaryHex = TextEditingController(text: widget.company.branding.secondaryColor);
  late final TextEditingController _tagline = TextEditingController(text: widget.company.branding.tagline);
  late final TextEditingController _headline = TextEditingController(text: widget.company.branding.headline);
  late final TextEditingController _heroBody = TextEditingController(text: widget.company.branding.heroBody);
  late final TextEditingController _welcome = TextEditingController(text: widget.company.branding.welcomeMessage);
  late final TextEditingController _website = TextEditingController(text: widget.company.branding.websiteUrl);
  late final TextEditingController _supportEmail = TextEditingController(text: widget.company.branding.supportEmail);
  late final TextEditingController _footerText = TextEditingController(text: widget.company.branding.footerText);
  final TextEditingController _newBadge = TextEditingController();

  late String? _logoAddress = widget.company.logoAddress;
  late String? _coverAddress = widget.company.coverAddress;
  int _tab = 0; // 0: Look & Media | 1: Copy | 2: White-Label
  bool _saving = false;
  bool _uploadingLogo = false;
  bool _uploadingCover = false;
  bool _mediaChanged = false;
  String? _error;

  String get _base => '/admin/organizations/${widget.company.id}';

  @override
  void dispose() {
    for (final c in [
      _displayName, _slug, _primaryHex, _secondaryHex, _tagline, _headline, _heroBody,
      _welcome, _website, _supportEmail, _footerText, _newBadge,
    ]) {
      c.dispose();
    }
    super.dispose();
  }

  bool get _dirty {
    return _displayName.text.trim() != widget.company.shownName ||
        _slug.text.trim().toLowerCase() != widget.company.slug.toLowerCase() ||
        _draft != _initial;
  }

  bool get _canSave {
    return _displayName.text.trim().isNotEmpty &&
        isValidPortalSlug(_slug.text) &&
        isValidHexColor(_draft.primaryColor) &&
        isValidHexColor(_draft.secondaryColor) &&
        isValidHttpsPortalUrl(_draft.websiteUrl) &&
        isValidSupportEmail(_draft.supportEmail);
  }

  String get _effectiveSlug => isValidPortalSlug(_slug.text) ? _slug.text.trim().toLowerCase() : widget.company.slug;

  void _syncHexControllers(PortalBranding next) {
    if (_primaryHex.text.toUpperCase() != next.primaryColor) _primaryHex.text = next.primaryColor;
    if (_secondaryHex.text.toUpperCase() != next.secondaryColor) _secondaryHex.text = next.secondaryColor;
  }

  Future<void> _uploadAsset({required bool cover}) async {
    final fr = context.isFrench;
    final maxBytes = cover ? _maxCoverBytes : _maxLogoBytes;
    final res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: _imgExts);
    final f = res?.files.single;
    if (f == null || !mounted) return;
    if (!_imgExts.contains(f.extension?.toLowerCase())) {
      adminToast(context, fr ? 'PNG, JPEG ou WebP uniquement.' : 'PNG, JPEG or WebP only.', error: true);
      return;
    }
    if (f.size > maxBytes) {
      adminToast(
        context,
        cover
            ? (fr ? 'L’image de couverture doit faire 2 Mo maximum.' : 'Cover image must be 2 MB or less.')
            : (fr ? 'Le logo doit faire 1 Mo maximum.' : 'Logo must be 1 MB or less.'),
        error: true,
      );
      return;
    }
    final bytes = f.bytes ?? (f.path != null ? null : null);
    if (f.path == null && bytes == null) return;
    setState(() {
      if (cover) {
        _uploadingCover = true;
      } else {
        _uploadingLogo = true;
      }
      _error = null;
    });
    try {
      final multipart = f.path != null
          ? await MultipartFile.fromFile(f.path!, filename: f.name)
          : MultipartFile.fromBytes(bytes!, filename: f.name);
      final fieldName = cover ? 'cover' : 'logo';
      final response = await ref.read(apiClientProvider).post(
        '$_base/$fieldName',
        data: FormData.fromMap({fieldName: multipart}),
      );
      if (!mounted) return;
      final data = J.map(response.data);
      final rawUrl = J.s(data[cover ? 'cover_url' : 'logo_url']);
      final full = rawUrl.isEmpty ? null : (rawUrl.startsWith('http') ? rawUrl : '${ApiEndpoints.baseUrl.replaceFirst(RegExp(r'/api/?$'), '')}$rawUrl');
      setState(() {
        _mediaChanged = true;
        if (cover) {
          _coverAddress = full;
          if (_draft.coverPlacement == 'hero' && _draft.heroStyle != 'cover') {
            _draft = _draft.copyWith(heroStyle: 'cover');
          }
        } else {
          _logoAddress = full;
        }
      });
      adminToast(context, cover ? (fr ? 'Couverture mise à jour' : 'Cover updated') : (fr ? 'Logo mis à jour' : 'Logo updated'));
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) {
        setState(() {
          _uploadingCover = false;
          _uploadingLogo = false;
        });
      }
    }
  }

  Future<void> _removeAsset({required bool cover}) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: cover ? (fr ? 'Supprimer la couverture ?' : 'Remove cover image?') : (fr ? 'Supprimer le logo ?' : 'Remove logo?'),
      message: cover
          ? (fr ? 'L’arrière-plan repassera sur le thème géométrique.' : 'The backdrop will switch back to geometric mode.')
          : (fr ? 'Les pages afficheront l’initiale de l’entreprise.' : 'Pages will show the company initial.'),
      confirmLabel: fr ? 'Supprimer' : 'Remove',
    );
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).delete('$_base/${cover ? 'cover' : 'logo'}');
      if (!mounted) return;
      setState(() {
        _mediaChanged = true;
        if (cover) {
          _coverAddress = null;
          if (_draft.heroStyle == 'cover') _draft = _draft.copyWith(heroStyle: 'geometric');
        } else {
          _logoAddress = null;
        }
      });
      adminToast(context, cover ? (fr ? 'Couverture supprimée' : 'Cover removed') : (fr ? 'Logo supprimé' : 'Logo removed'));
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  Future<void> _save() async {
    if (_saving || !_canSave) return;
    final fr = context.isFrench;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final nextSlug = _slug.text.trim().toLowerCase();
      final payload = <String, dynamic>{
        'display_name': _displayName.text.trim(),
        if (nextSlug != widget.company.slug.toLowerCase()) 'slug': nextSlug,
        'portal_branding': _draft.toJson(),
      };
      await ref.read(apiClientProvider).put(_base, data: payload);
      if (!mounted) return;
      _initial = _draft;
      adminToast(context, fr ? 'Personnalisation enregistrée' : 'Portal branding saved');
      Navigator.of(context).pop(true);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = apiErrorText(context, e);
        _saving = false;
      });
    }
  }

  Future<void> _resetDefaults() async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Réinitialiser le thème ?' : 'Reset portal theme?',
      message: fr ? 'Les couleurs, la mise en page et les textes personnalisés seront remis par défaut.' : 'Colors, layout and custom copy will revert to defaults.',
      confirmLabel: fr ? 'Réinitialiser' : 'Reset',
      danger: false,
    );
    if (!ok || !mounted) return;
    setState(() {
      _draft = const PortalBranding();
      _syncHexControllers(_draft);
      _tagline.text = '';
      _headline.text = '';
      _heroBody.text = '';
      _welcome.text = '';
      _website.text = '';
      _supportEmail.text = '';
      _footerText.text = '';
    });
  }

  List<String> get _currentBadges =>
      _draft.highlights ??
      (widget.company.language == 'fr'
          ? ['Compréhension écrite', 'Compréhension orale', 'Expression écrite', 'Expression orale']
          : ['Reading', 'Listening', 'Writing', 'Speaking']);

  void _addBadge() {
    final clean = _newBadge.text.trim();
    if (clean.isEmpty || _currentBadges.length >= 4) return;
    setState(() {
      _draft = _draft.copyWith(highlights: [..._currentBadges, clean.length > 36 ? clean.substring(0, 36) : clean]);
      _newBadge.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final shownName = _displayName.text.trim().isEmpty ? widget.company.name : _displayName.text.trim();
    final liveUrl = 'https://learnfrenchwithnatives.com/o/$_effectiveSlug';

    return PopScope(
      canPop: !_saving,
      onPopInvokedWithResult: (didPop, _) {},
      child: AdminPanel(
        title: fr ? 'Portail & Identité' : 'Portal & Branding',
        subtitle: widget.company.name,
        actions: [
          AdminButton(fr ? 'Réinitialiser' : 'Reset', primary: false, onPressed: _saving ? null : _resetDefaults),
          AdminButton(
            _mediaChanged && !_dirty ? (fr ? 'Fermer' : 'Done') : (fr ? 'Annuler' : 'Cancel'),
            primary: false,
            onPressed: _saving ? null : () => Navigator.of(context).pop(_mediaChanged),
          ),
          AdminButton(
            fr ? 'Enregistrer' : 'Save branding',
            key: const Key('portal-branding-save'),
            icon: Icons.check,
            busy: _saving,
            onPressed: (_dirty && _canSave) ? _save : null,
          ),
        ],
        children: [
          if (_error != null)
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.badBg,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.bad.withValues(alpha: 0.3)),
              ),
              child: Text(_error!, style: AppTypography.bodySmall.copyWith(color: AppColors.bad)),
            ),

          PortalLoginPreview(
            companyName: shownName,
            slug: _effectiveSlug,
            branding: _draft,
            logoUrl: _logoAddress,
            coverUrl: _coverAddress,
            initialLanguage: widget.company.language,
            onCopyLink: () {
              Clipboard.setData(ClipboardData(text: liveUrl));
              adminToast(context, fr ? 'Lien copié' : 'Link copied');
            },
            onOpenLive: () => launchUrl(Uri.parse(liveUrl), mode: LaunchMode.externalApplication),
          ),

          const SizedBox(height: 14),
          SegmentedButton<int>(
            segments: [
              ButtonSegment(value: 0, label: Text(fr ? 'Apparence' : 'Look & Media'), icon: const Icon(Icons.palette_outlined, size: 16)),
              ButtonSegment(value: 1, label: Text(fr ? 'Textes' : 'Portal Copy'), icon: const Icon(Icons.text_fields, size: 16)),
              ButtonSegment(value: 2, label: Text(fr ? 'Marque' : 'White-Label'), icon: const Icon(Icons.verified_user_outlined, size: 16)),
            ],
            selected: {_tab},
            onSelectionChanged: (s) => setState(() => _tab = s.first),
          ),
          const SizedBox(height: 14),

          if (_tab == 0) _buildLookTab(fr, shownName),
          if (_tab == 1) _buildCopyTab(fr, shownName),
          if (_tab == 2) _buildWhiteLabelTab(fr, shownName),
        ],
      ),
    );
  }

  Widget _box(Widget child) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.border),
        ),
        child: child,
      );

  Widget _buildLookTab(bool fr, String shownName) {
    final lightPrimary = isValidHexColor(_draft.primaryColor) && isLightHex(_draft.primaryColor);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _box(Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(fr ? 'Identité & URL du portail' : 'Portal Identity & Address', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            TextField(
              controller: _displayName,
              maxLength: 160,
              onChanged: (_) => setState(() {}),
              decoration: adminInputDecoration(fr ? 'Nom affiché aux apprenants' : 'Name shown to learners').copyWith(
                counterText: '',
                errorText: _displayName.text.trim().isEmpty ? (fr ? 'Obligatoire' : 'Required') : null,
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _slug,
              maxLength: 80,
              onChanged: (v) {
                final clean = v.toLowerCase().replaceAll(RegExp(r'[^a-z0-9-]'), '');
                if (clean != v) {
                  _slug.value = TextEditingValue(text: clean, selection: TextSelection.collapsed(offset: clean.length));
                }
                setState(() {});
              },
              decoration: adminInputDecoration(fr ? 'Adresse du portail' : 'Portal URL path').copyWith(
                prefixText: '/o/',
                counterText: '',
                errorText: isValidPortalSlug(_slug.text) ? null : (fr ? 'Lettres minuscules, chiffres et tirets uniquement' : 'Lowercase letters, numbers and hyphens only'),
              ),
            ),
          ],
        )),

        _box(Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(fr ? 'Visuels de marque' : 'Brand Visuals', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(fr ? 'Logo (max 1 Mo)' : 'Logo (max 1 MB)', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          AdminButton(
                            _logoAddress == null ? (fr ? 'Ajouter' : 'Upload') : (fr ? 'Changer' : 'Replace'),
                            icon: Icons.upload_file_outlined,
                            primary: false,
                            busy: _uploadingLogo,
                            onPressed: () => _uploadAsset(cover: false),
                          ),
                          if (_logoAddress != null)
                            AdminButton(fr ? 'Supprimer' : 'Remove', icon: Icons.delete_outline, primary: false, danger: true, onPressed: () => _removeAsset(cover: false)),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(fr ? 'Image de fond (max 2 Mo)' : 'Cover / feature image (max 2 MB)', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      Wrap(
                        spacing: 6,
                        runSpacing: 6,
                        children: [
                          AdminButton(
                            _coverAddress == null ? (fr ? 'Ajouter' : 'Upload') : (fr ? 'Changer' : 'Replace'),
                            icon: Icons.panorama_outlined,
                            primary: false,
                            busy: _uploadingCover,
                            onPressed: () => _uploadAsset(cover: true),
                          ),
                          if (_coverAddress != null)
                            AdminButton(fr ? 'Supprimer' : 'Remove', icon: Icons.delete_outline, primary: false, danger: true, onPressed: () => _removeAsset(cover: true)),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
            if (_coverAddress != null) ...[
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 10),
              Text(fr ? 'Position de l’image' : 'Image placement', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
              const SizedBox(height: 6),
              SegmentedButton<String>(
                showSelectedIcon: false,
                segments: [
                  ButtonSegment(value: 'hero', label: Text(fr ? 'Bannière' : 'Top / Hero', style: const TextStyle(fontSize: 11.5))),
                  ButtonSegment(value: 'full', label: Text(fr ? 'Page entière' : 'Full page', style: const TextStyle(fontSize: 11.5))),
                  ButtonSegment(value: 'card', label: Text(fr ? 'Image encadrée' : 'Feature card', style: const TextStyle(fontSize: 11.5))),
                ],
                selected: {_draft.coverPlacement},
                onSelectionChanged: (s) {
                  final next = s.first;
                  setState(() {
                    _draft = _draft.copyWith(
                      coverPlacement: next,
                      heroStyle: next == 'hero' ? 'cover' : null,
                    );
                  });
                },
              ),
              const SizedBox(height: 10),
              Text(
                fr ? 'Opacité de l’image : ${100 - _draft.coverOverlay}%' : 'Image opacity: ${100 - _draft.coverOverlay}%',
                style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
              ),
              Slider(
                min: 10,
                max: 100,
                divisions: 90,
                value: (100 - _draft.coverOverlay).clamp(10, 100).toDouble(),
                onChanged: (v) => setState(() => _draft = _draft.copyWith(coverOverlay: 100 - v.round())),
              ),
            ],
          ],
        )),

        _box(Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(fr ? 'Palettes prêtes à l’emploi' : 'Executive Color Presets', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                for (final p in portalThemePresets)
                  ChoiceChip(
                    selected: _draft.primaryColor == p.primaryColor && _draft.secondaryColor == p.secondaryColor,
                    onSelected: (_) {
                      setState(() {
                        _draft = _draft.copyWith(
                          primaryColor: p.primaryColor,
                          secondaryColor: p.secondaryColor,
                          surfaceTone: p.surfaceTone,
                          heroStyle: _coverAddress != null && _draft.heroStyle == 'cover' ? 'cover' : p.heroStyle,
                        );
                        _syncHexControllers(_draft);
                      });
                    },
                    avatar: CircleAvatar(backgroundColor: parseHexColor(p.primaryColor)),
                    label: Text(fr ? p.nameFr : p.name),
                  ),
              ],
            ),
            const SizedBox(height: 14),
            Text(fr ? 'Couleur principale' : 'Primary brand color', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            _swatchRow(
              selectedHex: _draft.primaryColor,
              controller: _primaryHex,
              onSelect: (hex) => setState(() {
                _draft = _draft.copyWith(primaryColor: hex);
                _syncHexControllers(_draft);
              }),
            ),
            if (lightPrimary)
              Padding(
                padding: const EdgeInsets.only(top: 6),
                child: Text(
                  fr ? 'Couleur claire : le texte des boutons passe automatiquement en foncé.' : 'Light primary: dark button text is automatically applied for contrast.',
                  style: AppTypography.caption.copyWith(color: AppColors.warn),
                ),
              ),
            const SizedBox(height: 12),
            Text(fr ? 'Couleur d’accent' : 'Accent color', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            _swatchRow(
              selectedHex: _draft.secondaryColor,
              controller: _secondaryHex,
              onSelect: (hex) => setState(() {
                _draft = _draft.copyWith(secondaryColor: hex);
                _syncHexControllers(_draft);
              }),
            ),
          ],
        )),

        _box(Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(fr ? 'Mise en page et style' : 'Layout & Surfaces', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            SegmentedButton<String>(
              segments: [
                ButtonSegment(value: 'split', label: Text(fr ? 'Partagé' : 'Split')),
                ButtonSegment(value: 'centered', label: Text(fr ? 'Centré' : 'Centered')),
                ButtonSegment(value: 'minimal', label: Text('Minimal')),
              ],
              selected: {_draft.loginLayout},
              onSelectionChanged: (s) => setState(() => _draft = _draft.copyWith(loginLayout: s.first)),
            ),
            const SizedBox(height: 12),
            Text(fr ? 'Arrière-plan' : 'Hero backdrop', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            SegmentedButton<String>(
              segments: [
                ButtonSegment(value: 'geometric', label: Text(fr ? 'Grille' : 'Grid')),
                ButtonSegment(value: 'gradient', label: Text(fr ? 'Dégradé' : 'Gradient')),
                ButtonSegment(value: 'solid', label: Text(fr ? 'Uni' : 'Solid')),
                ButtonSegment(value: 'cover', label: Text('Cover'), enabled: _coverAddress != null),
              ],
              selected: {_draft.heroStyle},
              onSelectionChanged: (s) {
                final next = s.first;
                setState(() {
                  _draft = _draft.copyWith(
                    heroStyle: next,
                    coverPlacement: next == 'cover' ? 'hero' : null,
                  );
                });
              },
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(fr ? 'Fond de page' : 'Page surface', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                      const SizedBox(height: 6),
                      SegmentedButton<String>(
                        showSelectedIcon: false,
                        segments: [
                          ButtonSegment(value: 'clean', label: Text(fr ? 'Pur' : 'Clean', style: const TextStyle(fontSize: 11))),
                          ButtonSegment(value: 'warm', label: Text(fr ? 'Chaud' : 'Warm', style: const TextStyle(fontSize: 11))),
                          ButtonSegment(value: 'slate', label: Text(fr ? 'Ardoise' : 'Slate', style: const TextStyle(fontSize: 11))),
                        ],
                        selected: {_draft.surfaceTone},
                        onSelectionChanged: (s) => setState(() => _draft = _draft.copyWith(surfaceTone: s.first)),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(fr ? 'Boutons' : 'Button corners', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
            const SizedBox(height: 6),
            SegmentedButton<String>(
              segments: [
                ButtonSegment(value: 'rounded', label: Text(fr ? 'Arrondi' : 'Rounded')),
                ButtonSegment(value: 'pill', label: Text(fr ? 'Pilule' : 'Pill')),
                ButtonSegment(value: 'sharp', label: Text(fr ? 'Carré' : 'Sharp')),
              ],
              selected: {_draft.buttonStyle},
              onSelectionChanged: (s) => setState(() => _draft = _draft.copyWith(buttonStyle: s.first)),
            ),
          ],
        )),
      ],
    );
  }

  Widget _swatchRow({
    required String selectedHex,
    required TextEditingController controller,
    required ValueChanged<String> onSelect,
  }) {
    return Row(
      children: [
        Expanded(
          child: Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final hex in portalQuickSwatches)
                GestureDetector(
                  onTap: () => onSelect(hex),
                  child: Container(
                    width: 28,
                    height: 28,
                    decoration: BoxDecoration(
                      color: parseHexColor(hex),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: selectedHex == hex ? const Color(0xFF0F172A) : Colors.black12,
                        width: selectedHex == hex ? 2.5 : 1,
                      ),
                    ),
                    child: selectedHex == hex ? Icon(Icons.check, size: 15, color: contrastForeground(parseHexColor(hex))) : null,
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(width: 10),
        SizedBox(
          width: 106,
          child: TextField(
            controller: controller,
            maxLength: 7,
            onChanged: (v) {
              final up = v.trim().toUpperCase();
              if (isValidHexColor(up)) {
                onSelect(up);
              } else {
                setState(() => _draft = _draft.copyWith(primaryColor: controller == _primaryHex ? up : null, secondaryColor: controller == _secondaryHex ? up : null));
              }
            },
            decoration: adminInputDecoration('#RRGGBB').copyWith(
              counterText: '',
              errorText: isValidHexColor(controller.text) ? null : 'Invalid',
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildCopyTab(bool fr, String shownName) {
    final badges = _currentBadges;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _box(Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(fr ? 'Textes personnalisés' : 'Custom Portal Copy', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            TextField(
              controller: _tagline,
              maxLength: 80,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(tagline: v.trim())),
              decoration: adminInputDecoration(fr ? 'Sous-titre sous le logo (facultatif)' : 'Portal tagline (optional)').copyWith(
                hintText: fr ? 'ex. Académie des langues' : 'e.g. Corporate Language Academy',
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _headline,
              maxLength: 110,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(headline: v.trim())),
              decoration: adminInputDecoration(fr ? 'Titre principal (facultatif)' : 'Hero headline (optional)').copyWith(
                hintText: fr ? 'Préparez le TCF avec $shownName' : 'Prepare for the TCF with $shownName',
              ),
            ),
            const SizedBox(height: 10),
            HeroRichField(
              controller: _heroBody,
              fr: fr,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(heroBody: v.trim())),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _welcome,
              maxLength: 240,
              maxLines: 3,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(welcomeMessage: v.trim())),
              decoration: adminInputDecoration(fr ? 'Message d’accueil (facultatif)' : 'Sign-in card welcome message (optional)').copyWith(
                hintText: fr ? 'Connectez-vous à votre espace de formation.' : 'Sign in to your learning portal.',
              ),
            ),
          ],
        )),

        _box(Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(fr ? 'Afficher les badges de programme' : 'Show feature highlight badges', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
              subtitle: Text(fr ? 'Jusqu’à 4 pastilles sur l’écran de bienvenue.' : 'Up to 4 short tags on the portal hero.', style: AppTypography.caption),
              value: _draft.showHighlights,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(showHighlights: v)),
            ),
            if (_draft.showHighlights) ...[
              const SizedBox(height: 8),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: [
                  for (var i = 0; i < badges.length; i++)
                    InputChip(
                      label: Text(badges[i]),
                      onDeleted: () => setState(() {
                        _draft = _draft.copyWith(highlights: [...badges]..removeAt(i));
                      }),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _newBadge,
                      maxLength: 36,
                      enabled: badges.length < 4,
                      onSubmitted: (_) => _addBadge(),
                      decoration: adminInputDecoration(fr ? 'Ajouter un badge' : 'Add highlight badge').copyWith(counterText: ''),
                    ),
                  ),
                  const SizedBox(width: 8),
                  AdminButton(fr ? 'Ajouter' : 'Add', primary: false, onPressed: badges.length < 4 ? _addBadge : null),
                ],
              ),
              if (_draft.highlights != null)
                Align(
                  alignment: Alignment.centerLeft,
                  child: TextButton(
                    onPressed: () => setState(() => _draft = _draft.copyWith(clearHighlights: true)),
                    child: Text(fr ? 'Rétablir les badges par défaut' : 'Use default badges'),
                  ),
                ),
            ],
          ],
        )),
      ],
    );
  }

  Widget _buildWhiteLabelTab(bool fr, String shownName) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _box(Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(fr ? 'Liens & Support' : 'Links & Support', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
            const SizedBox(height: 10),
            TextField(
              controller: _website,
              maxLength: 200,
              keyboardType: TextInputType.url,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(websiteUrl: v.trim())),
              decoration: adminInputDecoration(fr ? 'Site web de l’entreprise (https://)' : 'Company website URL (https://)').copyWith(
                hintText: 'https://www.company.com',
                counterText: '',
                errorText: isValidHttpsPortalUrl(_draft.websiteUrl) ? null : (fr ? 'URL publique https:// requise' : 'Must be a public https:// URL'),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _supportEmail,
              maxLength: 120,
              keyboardType: TextInputType.emailAddress,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(supportEmail: v.trim())),
              decoration: adminInputDecoration(fr ? 'E-mail de support (facultatif)' : 'Learner support email (optional)').copyWith(
                hintText: 'training@company.com',
                counterText: '',
                errorText: isValidSupportEmail(_draft.supportEmail) ? null : (fr ? 'E-mail invalide' : 'Invalid email address'),
              ),
            ),
            const SizedBox(height: 10),
            TextField(
              controller: _footerText,
              maxLength: 140,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(footerText: v.trim())),
              decoration: adminInputDecoration(fr ? 'Pied de page / copyright (facultatif)' : 'Custom footer copyright (optional)').copyWith(
                hintText: '© ${DateTime.now().year} $shownName',
              ),
            ),
          ],
        )),

        _box(Column(
          children: [
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(fr ? 'Masquer « Retour à l’accueil »' : 'Hide platform homepage link', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
              subtitle: Text(fr ? 'Garde les apprenants dans le portail de l’entreprise.' : 'Keeps learners on the company portal.', style: AppTypography.caption),
              value: _draft.hideBackToHome,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(hideBackToHome: v)),
            ),
            const Divider(height: 1),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(fr ? 'Badge d’accès privé vérifié' : 'Show private portal security notice', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
              subtitle: Text(fr ? 'Affiché sous le bouton de connexion.' : 'Shown beneath the sign-in button.', style: AppTypography.caption),
              value: _draft.securityBadge,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(securityBadge: v)),
            ),
            const Divider(height: 1),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: Text(fr ? 'Marque blanche complète (masquer « Propulsé par »)' : 'Full white-label (hide “Powered by”)', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
              subtitle: Text(fr ? 'Supprime les mentions de la plateforme sur /o/<slug> et les e-mails.' : 'Hides platform branding on /o/<slug> and emails.', style: AppTypography.caption),
              value: _draft.hidePoweredBy,
              onChanged: (v) => setState(() => _draft = _draft.copyWith(hidePoweredBy: v)),
            ),
          ],
        )),
      ],
    );
  }
}
