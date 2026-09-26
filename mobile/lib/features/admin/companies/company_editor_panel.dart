import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'company_model.dart';
import 'content_picker.dart';

/// Creates a company with its first manager, or edits its details.
/// Pops the saved company's id (creation) or true (edit).
class CompanyEditorPanel extends ConsumerStatefulWidget {
  final Company? company;
  const CompanyEditorPanel({super.key, this.company});

  @override
  ConsumerState<CompanyEditorPanel> createState() => _CompanyEditorPanelState();
}

class _CompanyEditorPanelState extends ConsumerState<CompanyEditorPanel> {
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

  late String _language = widget.company?.language ?? 'fr';
  late DateTime _starts = widget.company?.startsAt ?? DateTime.now();
  late DateTime? _ends = widget.company?.endsAt ?? endOfDay(addMonths(DateTime.now(), 3));
  List<Map<String, dynamic>> _content = [];
  bool _saving = false;
  String? _error;

  bool get _editing => widget.company != null;

  @override
  void initState() {
    super.initState();
    _seats.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    for (final c in [_name, _displayName, _seats, _notes, _ee, _eo, _first, _last, _email]) {
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

  Future<void> _save() async {
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
    if (!_editing && _content.isEmpty) {
      setState(() => _error = fr ? 'Choisissez au moins un examen que l’entreprise pourra utiliser.' : 'Choose at least one exam the company may use.');
      return;
    }
    setState(() => _saving = true);
    final body = <String, dynamic>{
      'name': _name.text.trim(),
      'display_name': _displayName.text.trim(),
      'default_language': _language,
      'access_starts_at': _starts.toUtc().toIso8601String(),
      'access_ends_at': _ends!.toUtc().toIso8601String(),
      'seat_limit': _seatValue,
      'notes': _notes.text.trim(),
    };
    try {
      final api = ref.read(apiClientProvider);
      if (_editing) {
        await api.put('/admin/organizations/${widget.company!.id}', data: body);
        if (!mounted) return;
        adminToast(context, fr ? 'Entreprise mise à jour' : 'Company updated');
        Navigator.of(context).pop(true);
      } else {
        final res = await api.post('/admin/organizations', data: {
          ...body,
          'content': [for (final c in _content) {'content_type': c['content_type'], 'content_id': c['content_id']}],
          'ee_credits': int.tryParse(_ee.text.trim()) ?? 0,
          'eo_credits': int.tryParse(_eo.text.trim()) ?? 0,
          'manager': {'first_name': _first.text.trim(), 'last_name': _last.text.trim(), 'email': _email.text.trim()},
        });
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

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    String? required(String? v) => (v ?? '').trim().isEmpty ? (fr ? 'Obligatoire' : 'Required') : null;
    final used = widget.company?.seatsUsed ?? 0;
    final tooLow = _editing && (_seatValue ?? 0) > 0 && _seatValue! < used;

    return Form(
      key: _form,
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
            onPressed: _save,
          ),
        ],
        children: [
          if (_error != null) _ErrorBanner(_error!),
          PanelSection(fr ? 'Entreprise' : 'Company'),
          AdminField(label: fr ? 'Nom de l’entreprise' : 'Company name', controller: _name, validator: required),
          AdminField(
            label: fr ? 'Nom affiché (facultatif)' : 'Displayed name (optional)',
            hint: fr ? 'Ce que voient ses apprenants' : 'What its learners see',
            controller: _displayName,
          ),
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
          if (!_editing) ...[
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
