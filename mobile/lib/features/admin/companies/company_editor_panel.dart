import 'dart:convert';
import 'dart:typed_data';

import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'company_model.dart';
import 'content_picker.dart';
import 'hero_rich_field.dart';
import 'portal_login_preview.dart';

/// Creates a company with its first manager, or edits its details.
/// Pops the saved company's id (creation) or true (edit).
class CompanyEditorPanel extends ConsumerStatefulWidget {
  final Company? company;
  const CompanyEditorPanel({super.key, this.company});

  @override
  ConsumerState<CompanyEditorPanel> createState() => _CompanyEditorPanelState();
}

class _CompanyEditorPanelState extends ConsumerState<CompanyEditorPanel> {
  static const _maxLogoBytes = 1024 * 1024;
  static const _maxCoverBytes = 2 * 1024 * 1024;
  static const _logoExtensions = ['png', 'jpg', 'jpeg', 'webp'];

  final _form = GlobalKey<FormState>();
  late final _name = TextEditingController(text: widget.company?.name ?? '');
  late final _displayName = TextEditingController(text: widget.company?.displayName ?? '');
  late final _seats = TextEditingController(text: '${widget.company?.seatLimit ?? 5}');
  late final _notes = TextEditingController(text: widget.company?.notes ?? '');
  final _ee = TextEditingController(text: '0');
  final _eo = TextEditingController(text: '0');
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _email = TextEditingController();
  late final _slug = TextEditingController(text: widget.company?.slug ?? '');
  late final _tagline = TextEditingController(text: widget.company?.branding.tagline ?? '');
  late final _headline = TextEditingController(text: widget.company?.branding.headline ?? '');
  late final _heroBody = TextEditingController(text: widget.company?.branding.heroBody ?? '');
  late final _primaryHex = TextEditingController(text: (widget.company?.branding ?? const PortalBranding()).primaryColor);
  late final _secondaryHex = TextEditingController(text: (widget.company?.branding ?? const PortalBranding()).secondaryColor);

  late String _language = widget.company?.language ?? 'fr';
  late PortalBranding _branding = widget.company?.branding ?? const PortalBranding();
  late DateTime _starts = widget.company?.startsAt ?? DateTime.now();
  late DateTime? _ends = widget.company?.endsAt ?? endOfDay(addMonths(DateTime.now(), 3));
  late List<Map<String, dynamic>> _content = List<Map<String, dynamic>>.from(widget.company?.content ?? const []);
  late String _initialContentSig = _contentSig(widget.company?.content ?? const []);
  late String? _existingLogoUrl = widget.company?.logoAddress;
  late String? _existingCoverUrl = widget.company?.coverAddress;
  bool _logoRemoved = false;
  ({String name, Uint8List bytes})? _logo;
  bool _pickingLogo = false;
  bool _coverRemoved = false;
  ({String name, Uint8List bytes})? _cover;
  bool _pickingCover = false;
  bool _loadingDetail = false;
  late bool _portalExpanded = widget.company != null;
  String? _logoError;
  String? _coverError;
  bool _saving = false;
  String? _error;

  static String _contentSig(List<Map<String, dynamic>> items) {
    final keys = [for (final c in items) '${c['content_type']}:${c['content_id']}']..sort();
    return keys.join(',');
  }

  bool get _editing => widget.company != null;

  @override
  void initState() {
    super.initState();
    _seats.addListener(() => setState(() {}));
    if (_editing && widget.company!.content.isEmpty) {
      _loadDetail();
    }
  }

  Future<void> _loadDetail() async {
    setState(() => _loadingDetail = true);
    try {
      final res = await ref.read(apiClientProvider).get('/admin/organizations/${widget.company!.id}');
      if (!mounted) return;
      final full = Company.fromJson(J.map(res.data));
      setState(() {
        if (_content.isEmpty && full.content.isNotEmpty) {
          _content = List<Map<String, dynamic>>.from(full.content);
          _initialContentSig = _contentSig(_content);
        }
        if ((full.notes ?? '').isNotEmpty && _notes.text.isEmpty) _notes.text = full.notes!;
        _existingLogoUrl ??= full.logoAddress;
        _existingCoverUrl ??= full.coverAddress;
        _branding = full.branding;
        _primaryHex.text = full.branding.primaryColor;
        _secondaryHex.text = full.branding.secondaryColor;
        if (_tagline.text.isEmpty && full.branding.tagline.isNotEmpty) _tagline.text = full.branding.tagline;
        if (_headline.text.isEmpty && full.branding.headline.isNotEmpty) _headline.text = full.branding.headline;
        if (_heroBody.text.isEmpty && full.branding.heroBody.isNotEmpty) _heroBody.text = full.branding.heroBody;
        if (_slug.text.isEmpty && full.slug.isNotEmpty) _slug.text = full.slug;
        _loadingDetail = false;
      });
    } catch (_) {
      if (mounted) setState(() => _loadingDetail = false);
    }
  }

  @override
  void dispose() {
    for (final c in [_name, _displayName, _seats, _notes, _ee, _eo, _first, _last, _email, _slug, _tagline, _headline, _heroBody, _primaryHex, _secondaryHex]) {
      c.dispose();
    }
    super.dispose();
  }

  int? get _seatValue => int.tryParse(_seats.text.trim());

  Future<void> _pickDate({required bool start}) async {
    final now = DateTime.now();
    final current = start ? _starts : (_ends ?? now);
    final picked = await showDatePicker(
      context: context,
      initialDate: current,
      firstDate: DateTime(now.year - 3),
      lastDate: DateTime(now.year + 6),
    );
    if (picked == null || !mounted) return;
    setState(() {
      if (start) {
        _starts = DateTime(picked.year, picked.month, picked.day, _starts.hour, _starts.minute);
      } else {
        _ends = endOfDay(picked);
      }
    });
  }

  Future<void> _pickContent() async {
    final fr = context.isFrench;
    final picked = await pickCompanyContent(context, initial: _content, title: fr ? 'Examens autorisés' : 'Allowed exams');
    if (picked != null && mounted) setState(() => _content = picked);
  }

  Future<void> _pickLogo() async {
    if (_pickingLogo || _saving) return;
    final fr = context.isFrench;
    final tooLarge = fr ? 'Le logo doit faire 1 Mo au plus.' : 'The logo must be 1 MB or less.';
    final unreadable = fr ? 'Impossible de lire ce logo. Choisissez une autre image.' : 'Could not read this logo. Choose another image.';
    setState(() {
      _pickingLogo = true;
      _logoError = null;
    });
    try {
      final result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: _logoExtensions);
      final file = result?.files.single;
      if (file == null || !mounted) return;
      if (!_logoExtensions.contains(file.extension?.toLowerCase())) {
        setState(() => _logoError = fr ? 'Choisissez une image PNG, JPEG ou WebP.' : 'Choose a PNG, JPEG or WebP image.');
        return;
      }
      if (file.size > _maxLogoBytes) {
        setState(() => _logoError = tooLarge);
        return;
      }
      final bytes = file.bytes ?? await file.xFile.readAsBytes();
      if (!mounted) return;
      setState(() {
        if (bytes.length > _maxLogoBytes) {
          _logoError = tooLarge;
        } else if (bytes.isEmpty) {
          _logoError = unreadable;
        } else {
          _logo = (name: file.name, bytes: bytes);
          _logoRemoved = false;
        }
      });
    } catch (_) {
      if (mounted) setState(() => _logoError = unreadable);
    } finally {
      if (mounted) setState(() => _pickingLogo = false);
    }
  }

  Future<void> _pickCover() async {
    if (_pickingCover || _saving) return;
    final fr = context.isFrench;
    final tooLarge = fr ? 'L’image doit faire 2 Mo au plus.' : 'The image must be 2 MB or less.';
    final unreadable = fr ? 'Impossible de lire cette image.' : 'Could not read this image.';
    setState(() {
      _pickingCover = true;
      _coverError = null;
    });
    try {
      final result = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: _logoExtensions);
      final file = result?.files.single;
      if (file == null || !mounted) return;
      if (!_logoExtensions.contains(file.extension?.toLowerCase())) {
        setState(() => _coverError = fr ? 'Choisissez une image PNG, JPEG ou WebP.' : 'Choose a PNG, JPEG or WebP image.');
        return;
      }
      if (file.size > _maxCoverBytes) {
        setState(() => _coverError = tooLarge);
        return;
      }
      final bytes = file.bytes ?? await file.xFile.readAsBytes();
      if (!mounted) return;
      setState(() {
        if (bytes.length > _maxCoverBytes) {
          _coverError = tooLarge;
        } else if (bytes.isEmpty) {
          _coverError = unreadable;
        } else {
          _cover = (name: file.name, bytes: bytes);
          _coverRemoved = false;
          if (_branding.coverPlacement == 'hero') {
            _branding = _branding.copyWith(heroStyle: 'cover');
          }
        }
      });
    } catch (_) {
      if (mounted) setState(() => _coverError = unreadable);
    } finally {
      if (mounted) setState(() => _pickingCover = false);
    }
  }

  Future<void> _save() async {
    if (_saving || _pickingLogo || _pickingCover || _loadingDetail) return;
    final fr = context.isFrench;
    setState(() => _error = null);
    if (!(_form.currentState?.validate() ?? false)) return;
    if (_ends == null || !_ends!.isAfter(_starts)) {
      setState(() => _error = fr ? 'La date de fin doit être après la date de début.' : 'The end date must be after the start date.');
      return;
    }
    if (!_editing && !_ends!.isAfter(DateTime.now())) {
      setState(() => _error = fr ? 'La date de fin doit être dans le futur.' : 'The end date must be in the future.');
      return;
    }
    if (_content.isEmpty && (!_editing || _initialContentSig.isNotEmpty)) {
      setState(() => _error = fr ? 'Choisissez au moins un examen que l’entreprise pourra utiliser.' : 'Choose at least one exam the company may use.');
      return;
    }
    final slugText = _slug.text.trim().toLowerCase();
    if (_editing && !isValidPortalSlug(slugText)) {
      setState(() => _error = fr ? 'L’URL du portail n’est pas valide.' : 'Enter a valid portal URL slug.');
      return;
    }
    if (!isValidHexColor(_branding.primaryColor) || !isValidHexColor(_branding.secondaryColor)) {
      setState(() => _error = fr ? 'Couleur hexadécimale invalide (ex. #16325C).' : 'Enter valid #RRGGBB colors for primary and secondary.');
      return;
    }
    setState(() => _saving = true);
    final updatedBranding = _branding.copyWith(
      tagline: _tagline.text.trim(),
      headline: _headline.text.trim(),
      heroBody: _heroBody.text.trim(),
    );
    final body = <String, dynamic>{
      'name': _name.text.trim(),
      'display_name': _displayName.text.trim(),
      'default_language': _language,
      'access_starts_at': _starts.toUtc().toIso8601String(),
      'access_ends_at': _ends!.toUtc().toIso8601String(),
      'seat_limit': _seatValue,
      'notes': _notes.text.trim(),
      if (_editing) 'slug': slugText,
      if (_editing) 'portal_branding': updatedBranding.toJson(),
    };
    try {
      final api = ref.read(apiClientProvider);
      if (_editing) {
        final orgId = widget.company!.id;
        await api.put('/admin/organizations/$orgId', data: body);
        if (_content.isNotEmpty && _contentSig(_content) != _initialContentSig) {
          await api.put('/admin/organizations/$orgId/content', data: {
            'content': [for (final c in _content) {'content_type': c['content_type'], 'content_id': c['content_id']}],
          });
        }
        if (_logo != null) {
          await api.post(
            '/admin/organizations/$orgId/logo',
            data: FormData.fromMap({'logo': MultipartFile.fromBytes(_logo!.bytes, filename: _logo!.name)}),
          );
        } else if (_logoRemoved && widget.company!.logoUrl != null) {
          await api.delete('/admin/organizations/$orgId/logo');
        }
        if (_cover != null) {
          await api.post(
            '/admin/organizations/$orgId/cover',
            data: FormData.fromMap({'cover': MultipartFile.fromBytes(_cover!.bytes, filename: _cover!.name)}),
          );
        } else if (_coverRemoved && widget.company!.coverUrl != null) {
          await api.delete('/admin/organizations/$orgId/cover');
        }
        if (!mounted) return;
        adminToast(context, fr ? 'Entreprise mise à jour' : 'Company updated');
        Navigator.of(context).pop(true);
      } else {
        final payload = {
          ...body,
          if (slugText.isNotEmpty) 'slug': slugText,
          'portal_branding': updatedBranding.toJson(),
          'content': [for (final c in _content) {'content_type': c['content_type'], 'content_id': c['content_id']}],
          'ee_credits': int.tryParse(_ee.text.trim()) ?? 0,
          'eo_credits': int.tryParse(_eo.text.trim()) ?? 0,
          'manager': {'first_name': _first.text.trim(), 'last_name': _last.text.trim(), 'email': _email.text.trim()},
        };
        final logo = _logo;
        final cover = _cover;
        final res = await api.post('/admin/organizations', data: (logo == null && cover == null)
            ? payload
            : FormData.fromMap({
                'payload': jsonEncode(payload),
                if (logo != null) 'logo': MultipartFile.fromBytes(logo.bytes, filename: logo.name),
                if (cover != null) 'cover': MultipartFile.fromBytes(cover.bytes, filename: cover.name),
              }));
        if (!mounted) return;
        final d = J.map(res.data);
        final sent = J.map(d['manager'])['invitation_sent'] == true;
        adminToast(
          context,
          sent
              ? (fr ? 'Entreprise créée : le responsable a reçu son invitation par e-mail' : 'Company created: the manager received their invitation by email')
              : (fr ? 'Entreprise créée, mais l’e-mail d’invitation n’est pas parti : renvoyez-le depuis la fiche' : 'Company created, but the invitation email failed: send it again from the company page'),
          error: !sent,
        );
        Navigator.of(context).pop(J.i(J.map(d['organization'])['id']));
      }
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = apiErrorText(context, e);
        _saving = false;
      });
    }
  }

  Widget _logoField(bool fr) {
    final logo = _logo;
    final remoteLogo = _logoRemoved ? null : _existingLogoUrl;
    final hasAnyLogo = logo != null || remoteLogo != null;
    const placeholder = Icon(Icons.image_outlined, color: AppColors.adminAccent);
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(
              width: 52,
              height: 52,
              alignment: Alignment.center,
              clipBehavior: Clip.antiAlias,
              decoration: BoxDecoration(color: AppColors.frenchPaper, borderRadius: BorderRadius.circular(10)),
              child: logo != null
                  ? Image.memory(logo.bytes, fit: BoxFit.contain, cacheWidth: 156, errorBuilder: (_, _, _) => placeholder)
                  : remoteLogo != null
                      ? Image.network(remoteLogo, fit: BoxFit.contain, cacheWidth: 156, errorBuilder: (_, _, _) => placeholder)
                      : placeholder,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(fr ? 'Logo de l’entreprise (facultatif)' : 'Company logo (optional)', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                  _Hint(logo?.name ?? (remoteLogo != null ? (fr ? 'Logo actuel enregistré' : 'Current logo saved') : (fr ? 'PNG, JPEG ou WebP · 1 Mo max.' : 'PNG, JPEG or WebP · 1 MB max.'))),
                ],
              ),
            ),
          ]),
          if (_logoError != null) _ErrorBanner(_logoError!),
          const SizedBox(height: 8),
          Wrap(spacing: 8, runSpacing: 6, children: [
            AdminButton(
              hasAnyLogo ? (fr ? 'Changer le logo' : 'Change logo') : (fr ? 'Ajouter un logo' : 'Add a logo'),
              icon: Icons.upload_file_outlined,
              primary: false,
              busy: _pickingLogo,
              onPressed: _saving ? null : _pickLogo,
            ),
            if (hasAnyLogo)
              AdminButton(
                fr ? 'Retirer le logo' : 'Remove logo',
                primary: false,
                onPressed: _saving || _pickingLogo ? null : () => setState(() {
                  _logo = null;
                  _logoRemoved = true;
                  _logoError = null;
                }),
              ),
          ]),
        ],
      ),
    );
  }

  Widget _portalColorRow(bool fr, {required bool isPrimary}) {
    final current = isPrimary ? _branding.primaryColor : _branding.secondaryColor;
    final ctrl = isPrimary ? _primaryHex : _secondaryHex;
    final title = isPrimary ? (fr ? 'Couleur principale' : 'Primary color') : (fr ? 'Couleur secondaire' : 'Secondary color');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.textMuted)),
        const SizedBox(height: 6),
        Row(children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: parseHexColor(current),
              borderRadius: BorderRadius.circular(8),
              border: Border.all(color: Colors.black12),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: TextField(
              controller: ctrl,
              maxLength: 7,
              onChanged: (v) {
                final hex = v.trim().toUpperCase();
                if (isValidHexColor(hex)) {
                  setState(() {
                    _branding = isPrimary
                        ? _branding.copyWith(primaryColor: hex)
                        : _branding.copyWith(secondaryColor: hex);
                  });
                }
              },
              decoration: adminInputDecoration('#RRGGBB').copyWith(counterText: '', isDense: true),
            ),
          ),
        ]),
        const SizedBox(height: 6),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            for (final hex in portalQuickSwatches)
              InkWell(
                onTap: () => setState(() {
                  ctrl.text = hex;
                  _branding = isPrimary
                      ? _branding.copyWith(primaryColor: hex)
                      : _branding.copyWith(secondaryColor: hex);
                }),
                borderRadius: BorderRadius.circular(14),
                child: Container(
                  width: 24,
                  height: 24,
                  decoration: BoxDecoration(
                    color: parseHexColor(hex),
                    shape: BoxShape.circle,
                    border: Border.all(
                      color: current.toUpperCase() == hex ? AppColors.ink : Colors.black12,
                      width: current.toUpperCase() == hex ? 2.2 : 1,
                    ),
                  ),
                ),
              ),
          ],
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    String? required(String? v) => (v ?? '').trim().isEmpty ? (fr ? 'Obligatoire' : 'Required') : null;
    final used = widget.company?.seatsUsed ?? 0;
    final tooLow = _editing && (_seatValue ?? 0) > 0 && _seatValue! < used;
    final hasAnyCover = _cover != null || (!_coverRemoved && _existingCoverUrl != null);

    return Form(
      key: _form,
      canPop: !_saving,
      child: AdminPanel(
        title: _editing ? (fr ? 'Modifier l’entreprise' : 'Edit the company') : (fr ? 'Nouvelle entreprise' : 'New company'),
        subtitle: _editing
            ? widget.company!.shownName
            : (fr ? 'Son responsable reçoit un e-mail avec un mot de passe temporaire.' : 'Its manager receives an email with a temporary password.'),
        actions: [
          AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: _saving ? null : () => Navigator.of(context).pop()),
          AdminButton(
            _editing ? (fr ? 'Enregistrer' : 'Save') : (fr ? 'Créer l’entreprise' : 'Create the company'),
            key: const Key('company-save'),
            icon: _editing ? Icons.check : Icons.add_business_outlined,
            busy: _saving,
            onPressed: _pickingLogo || _pickingCover || _loadingDetail ? null : _save,
          ),
        ],
        children: [
          if (_loadingDetail) ...[
            const LinearProgressIndicator(minHeight: 2),
            const SizedBox(height: 8),
          ],
          if (_error != null) _ErrorBanner(_error!),
          PanelSection(fr ? 'Entreprise' : 'Company'),
          AdminField(label: fr ? 'Nom de l’entreprise' : 'Company name', controller: _name, validator: required),
          AdminField(
            label: fr ? 'Nom affiché (facultatif)' : 'Displayed name (optional)',
            hint: fr ? 'Ce que voient ses apprenants' : 'What its learners see',
            controller: _displayName,
          ),
          _logoField(fr),
          const SizedBox(height: 12),
          AdminSelect<String>(
            label: fr ? 'Langue par défaut' : 'Default language',
            value: _language,
            options: const [FilterOption('fr', 'Français'), FilterOption('en', 'English')],
            onChanged: (v) => setState(() => _language = v ?? 'fr'),
          ),
          PanelSection(fr ? 'Accès' : 'Access'),
          Row(children: [
            Expanded(child: _DateBox(label: fr ? 'Du' : 'From', value: AdminFmt.day(context, _starts), onTap: () => _pickDate(start: true))),
            const SizedBox(width: 10),
            Expanded(child: _DateBox(label: fr ? 'Au' : 'Until', value: _ends == null ? '—' : AdminFmt.day(context, _ends), onTap: () => _pickDate(start: false))),
          ]),
          const SizedBox(height: 8),
          Wrap(spacing: 8, runSpacing: 6, children: [
            for (final (m, label) in [(3, fr ? '3 mois' : '3 months'), (6, fr ? '6 mois' : '6 months'), (12, fr ? '1 an' : '1 year')])
              ActionChip(
                label: Text(label),
                onPressed: () => setState(() => _ends = endOfDay(addMonths(_starts.isAfter(DateTime.now()) ? _starts : DateTime.now(), m))),
                labelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.adminAccent),
                backgroundColor: AppColors.pureWhite,
                side: const BorderSide(color: AppColors.border),
                visualDensity: VisualDensity.compact,
              ),
          ]),
          _Hint(fr
              ? 'Après la date de fin, l’entreprise et ses apprenants peuvent encore se connecter et voir leurs résultats ; examens, attributions et crédits sont fermés jusqu’à ce que vous prolongiez.'
              : 'After the end date the company and its learners can still sign in and see results; exams, assignments and credits are closed until you extend the date.'),
          PanelSection(fr ? 'Forfait' : 'Package'),
          AdminField(
            key: const Key('company-seats'),
            label: fr ? 'Nombre de comptes apprenants' : 'Number of learner accounts',
            controller: _seats,
            keyboardType: TextInputType.number,
            validator: (v) {
              final n = int.tryParse((v ?? '').trim());
              if (n == null || n < 1 || n > 100000) return fr ? 'Un nombre entier, au moins 1' : 'A whole number, at least 1';
              return null;
            },
          ),
          if (tooLow)
            _ErrorBanner(
              fr
                  ? 'L’entreprise a déjà $used compte(s) apprenant(s). Avec un forfait de $_seatValue, elle ne pourra plus en ajouter tant qu’il n’est pas relevé.'
                  : 'The company already has $used learner account(s). With a package of $_seatValue it cannot add more until you raise it.',
              warn: true,
            ),
          _Hint(fr
              ? 'Chaque compte compte, actif ou désactivé : désactiver un apprenant ne libère pas de place. Vous pouvez l’augmenter à tout moment.'
              : 'Every account counts, active or deactivated: deactivating a learner does not free a place. You can raise it at any time.'),
          PanelSection(
            fr ? 'Examens autorisés' : 'Allowed exams',
            trailing: TextButton.icon(
              key: const Key('company-pick-content'),
              onPressed: _pickContent,
              icon: const Icon(Icons.checklist, size: 18),
              label: Text(_content.isEmpty ? (fr ? 'Choisir' : 'Choose') : (fr ? 'Modifier' : 'Change')),
            ),
          ),
          if (_content.isEmpty)
            _Hint(fr ? 'Aucun examen choisi. L’entreprise n’attribue que dans ce périmètre.' : 'No exam chosen yet. The company assigns only within this.')
          else
            ContentChips(_content),
          if (!_editing) ...[
            PanelSection(fr ? 'Crédits IA (réserve)' : 'AI credits (reserve)'),
            Row(children: [
              Expanded(child: AdminField(label: fr ? 'Crédits EE' : 'EE credits', controller: _ee, keyboardType: TextInputType.number)),
              const SizedBox(width: 10),
              Expanded(child: AdminField(label: fr ? 'Crédits EO' : 'EO credits', controller: _eo, keyboardType: TextInputType.number)),
            ]),
            _Hint(fr
                ? 'Ses responsables les distribuent aux apprenants et ne peuvent jamais donner plus que cette réserve.'
                : 'Its managers hand them out to learners and can never give more than this reserve.'),
            PanelSection(fr ? 'Premier responsable' : 'First manager'),
            LayoutBuilder(builder: (context, c) {
              final first = AdminField(label: fr ? 'Prénom' : 'First name', controller: _first, validator: required);
              final last = AdminField(label: fr ? 'Nom' : 'Last name', controller: _last, validator: required);
              if (c.maxWidth < 380) return Column(children: [first, last]);
              return Row(crossAxisAlignment: CrossAxisAlignment.start, children: [Expanded(child: first), const SizedBox(width: 10), Expanded(child: last)]);
            }),
            AdminField(
              label: fr ? 'Adresse e-mail' : 'Email address',
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              validator: (v) => RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch((v ?? '').trim()) ? null : (fr ? 'E-mail invalide' : 'Enter a valid email'),
            ),
          ],
          PanelSection(fr ? 'Notes internes' : 'Internal notes'),
          AdminField(label: fr ? 'Notes (visibles des administrateurs seulement)' : 'Notes (administrators only)', controller: _notes, maxLines: 3),
          PanelSection(fr ? 'Portail & Identité' : 'Portal & Branding'),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.pureWhite,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Container(
                      width: 14,
                      height: 14,
                      decoration: BoxDecoration(
                        color: parseHexColor(_branding.primaryColor),
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.black12),
                      ),
                    ),
                    Text(
                      '${_branding.loginLayout.toUpperCase()} · /o/${_slug.text.trim().isEmpty ? 'auto' : _slug.text.trim()}',
                      style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
                    ),
                    TextButton.icon(
                      key: const Key('company-portal-toggle'),
                      onPressed: () => setState(() => _portalExpanded = !_portalExpanded),
                      icon: Icon(_portalExpanded ? Icons.expand_less : Icons.palette_outlined, size: 17),
                      label: Text(_portalExpanded ? (fr ? 'Masquer' : 'Hide') : (fr ? 'Personnaliser' : 'Customize')),
                    ),
                    TextButton.icon(
                      key: const Key('company-preview-portal'),
                      onPressed: () => showPortalPreviewDialog(
                        context,
                        companyName: _displayName.text.trim().isEmpty ? _name.text.trim() : _displayName.text.trim(),
                        slug: _slug.text.trim().isEmpty ? 'company' : _slug.text.trim(),
                        branding: _branding.copyWith(
                          tagline: _tagline.text.trim(),
                          headline: _headline.text.trim(),
                          heroBody: _heroBody.text.trim(),
                        ),
                        logoBytes: _logo?.bytes,
                        logoUrl: _logoRemoved ? null : _existingLogoUrl,
                        coverBytes: _cover?.bytes,
                        coverUrl: _coverRemoved ? null : _existingCoverUrl,
                        initialLanguage: _language,
                      ),
                      icon: const Icon(Icons.visibility_outlined, size: 17),
                      label: Text(fr ? 'Aperçu' : 'Preview'),
                    ),
                  ],
                ),
                if (_portalExpanded) ...[
                  const SizedBox(height: 8),
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
                    decoration: adminInputDecoration(fr ? 'URL du portail (facultatif)' : 'Portal URL (optional)').copyWith(
                      prefixText: '/o/',
                      hintText: fr ? 'auto-selon-le-nom' : 'auto-from-name',
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _tagline,
                    maxLength: 80,
                    decoration: adminInputDecoration(fr ? 'Sous-titre du portail (facultatif)' : 'Portal tagline (optional)').copyWith(
                      hintText: fr ? 'ex. Académie de français' : 'e.g. Corporate French Academy',
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 6,
                    runSpacing: 6,
                    children: [
                      for (final p in portalThemePresets)
                        ChoiceChip(
                          selected: _branding.primaryColor == p.primaryColor && _branding.secondaryColor == p.secondaryColor,
                          onSelected: (_) => setState(() {
                            _primaryHex.text = p.primaryColor;
                            _secondaryHex.text = p.secondaryColor;
                            _branding = _branding.copyWith(
                              primaryColor: p.primaryColor,
                              secondaryColor: p.secondaryColor,
                              surfaceTone: p.surfaceTone,
                              heroStyle: hasAnyCover && _branding.heroStyle == 'cover' ? 'cover' : p.heroStyle,
                            );
                          }),
                          avatar: CircleAvatar(backgroundColor: parseHexColor(p.primaryColor)),
                          label: Text(fr ? p.nameFr : p.name),
                          visualDensity: VisualDensity.compact,
                        ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _portalColorRow(fr, isPrimary: true),
                  const SizedBox(height: 10),
                  _portalColorRow(fr, isPrimary: false),
                  const SizedBox(height: 10),
                  SegmentedButton<String>(
                    showSelectedIcon: false,
                    style: const ButtonStyle(visualDensity: VisualDensity.compact),
                    segments: [
                      ButtonSegment(value: 'split', label: Text(fr ? 'Partagé' : 'Split', style: const TextStyle(fontSize: 12))),
                      ButtonSegment(value: 'centered', label: Text(fr ? 'Centré' : 'Centered', style: const TextStyle(fontSize: 12))),
                      ButtonSegment(value: 'minimal', label: const Text('Minimal', style: TextStyle(fontSize: 12))),
                    ],
                    selected: {_branding.loginLayout},
                    onSelectionChanged: (s) => setState(() => _branding = _branding.copyWith(loginLayout: s.first)),
                  ),
                  const SizedBox(height: 12),
                  const Divider(height: 1),
                  const SizedBox(height: 10),
                  Text(fr ? 'Image de fond ou encadrée (max 2 Mo)' : 'Background or feature image (max 2 MB)', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.textMuted)),
                  const SizedBox(height: 6),
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    crossAxisAlignment: WrapCrossAlignment.center,
                    children: [
                      AdminButton(
                        hasAnyCover ? (fr ? 'Changer l’image' : 'Change image') : (fr ? 'Ajouter une image' : 'Add image'),
                        icon: Icons.panorama_outlined,
                        primary: false,
                        busy: _pickingCover,
                        onPressed: _saving ? null : _pickCover,
                      ),
                      if (hasAnyCover)
                        AdminButton(
                          fr ? 'Retirer' : 'Remove',
                          primary: false,
                          onPressed: _saving || _pickingCover ? null : () => setState(() {
                            _cover = null;
                            _coverRemoved = true;
                            _coverError = null;
                            if (_branding.heroStyle == 'cover') {
                              _branding = _branding.copyWith(heroStyle: 'geometric');
                            }
                          }),
                        ),
                    ],
                  ),
                  if (_cover != null) _Hint(_cover!.name),
                  if (_coverError != null) _ErrorBanner(_coverError!),
                  if (hasAnyCover) ...[
                    const SizedBox(height: 8),
                    SegmentedButton<String>(
                      showSelectedIcon: false,
                      style: const ButtonStyle(visualDensity: VisualDensity.compact),
                      segments: [
                        ButtonSegment(value: 'hero', label: Text(fr ? 'Bannière' : 'Top / Hero', style: const TextStyle(fontSize: 11.5))),
                        ButtonSegment(value: 'full', label: Text(fr ? 'Page entière' : 'Full page', style: const TextStyle(fontSize: 11.5))),
                        ButtonSegment(value: 'card', label: Text(fr ? 'Image encadrée' : 'Feature card', style: const TextStyle(fontSize: 11.5))),
                      ],
                      selected: {_branding.coverPlacement},
                      onSelectionChanged: (s) {
                        final next = s.first;
                        setState(() {
                          _branding = _branding.copyWith(
                            coverPlacement: next,
                            heroStyle: next == 'hero' ? 'cover' : null,
                          );
                        });
                      },
                    ),
                    const SizedBox(height: 6),
                    Text(
                      fr ? 'Opacité de l’image : ${100 - _branding.coverOverlay}%' : 'Image opacity: ${100 - _branding.coverOverlay}%',
                      style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700),
                    ),
                    Slider(
                      min: 10,
                      max: 100,
                      divisions: 90,
                      value: (100 - _branding.coverOverlay).clamp(10, 100).toDouble(),
                      onChanged: (v) => setState(() => _branding = _branding.copyWith(coverOverlay: 100 - v.round())),
                    ),
                  ],
                  const SizedBox(height: 10),
                  TextField(
                    controller: _headline,
                    maxLength: 110,
                    onChanged: (v) => setState(() => _branding = _branding.copyWith(headline: v.trim())),
                    decoration: adminInputDecoration(fr ? 'Titre principal (facultatif)' : 'Hero headline (optional)').copyWith(
                      counterText: '',
                    ),
                  ),
                  const SizedBox(height: 8),
                  HeroRichField(
                    controller: _heroBody,
                    fr: fr,
                    minLines: 3,
                    onChanged: (v) => setState(() => _branding = _branding.copyWith(heroBody: v.trim())),
                  ),
                  const SizedBox(height: 6),
                  _Hint(fr
                      ? 'Ajoutez du texte mis en forme ou une image, puis ouvrez Aperçu pour voir le résultat en direct.'
                      : 'Add formatted hero text or an image, then tap Preview to inspect the live login page.'),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// The chosen exam content as coloured chips.
class ContentChips extends StatelessWidget {
  final List<Map<String, dynamic>> items;
  const ContentChips(this.items, {super.key});

  @override
  Widget build(BuildContext context) {
    return Wrap(spacing: 6, runSpacing: 6, children: [
      for (final c in items)
        Builder(builder: (_) {
          final f = familyOf(c);
          final name = J.s(c['name']).isEmpty ? '${c['content_type']} #${c['content_id']}' : J.s(c['name']);
          return Pill(name, color: f.color);
        }),
    ]);
  }
}

class _DateBox extends StatelessWidget {
  final String label;
  final String value;
  final VoidCallback onTap;
  const _DateBox({required this.label, required this.value, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(10),
      child: InputDecorator(
        decoration: adminInputDecoration(label, suffix: const Icon(Icons.calendar_today_outlined, size: 18)),
        child: Text(value, style: AppTypography.bodyMedium),
      ),
    );
  }
}

class _Hint extends StatelessWidget {
  final String text;
  const _Hint(this.text);

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(top: 4, bottom: 4),
        child: Text(text, style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.4)),
      );
}

class _ErrorBanner extends StatelessWidget {
  final String text;
  final bool warn;
  const _ErrorBanner(this.text, {this.warn = false});

  @override
  Widget build(BuildContext context) {
    final color = warn ? AppColors.warn : AppColors.bad;
    return Container(
      margin: const EdgeInsets.only(top: 10, bottom: 6),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: warn ? AppColors.warnBg : AppColors.badBg,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Icon(warn ? Icons.warning_amber_rounded : Icons.error_outline, size: 18, color: color),
        const SizedBox(width: 8),
        Expanded(child: Text(text, style: AppTypography.bodySmall.copyWith(color: color, height: 1.4))),
      ]),
    );
  }
}
