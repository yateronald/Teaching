import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'marketing_model.dart';
import 'marketing_widgets.dart';

/// One person who registered for a campaign: how to reach them, where their
/// registration stands, and the team's notes.
class RegistrationPanel extends ConsumerStatefulWidget {
  final Campaign campaign;
  final Map<String, dynamic> registration;
  const RegistrationPanel({super.key, required this.campaign, required this.registration});

  @override
  ConsumerState<RegistrationPanel> createState() => _RegistrationPanelState();
}

class _RegistrationPanelState extends ConsumerState<RegistrationPanel> {
  late Map<String, dynamic> _r = Map.of(widget.registration);
  late final _notes = TextEditingController(text: J.s(widget.registration['notes']));
  bool _busy = false;
  bool _notesDirty = false;

  String get _path => '/admin/promotions/${widget.campaign.id}/registrations/${J.i(_r['id'])}';
  String get _status => J.s(_r['status']).isEmpty ? 'new' : J.s(_r['status']);

  @override
  void initState() {
    super.initState();
    _notes.addListener(() {
      final dirty = _notes.text != J.s(_r['notes']);
      if (dirty != _notesDirty) setState(() => _notesDirty = dirty);
    });
  }

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  Future<void> _patch(Map<String, dynamic> body, String done) async {
    setState(() => _busy = true);
    try {
      final res = await ref.read(apiClientProvider).patch(_path, data: body);
      if (!mounted) return;
      final fresh = J.map(J.map(res.data)['registration']);
      setState(() {
        _r = {..._r, ...body, ...fresh};
        _notesDirty = _notes.text != J.s(_r['notes']);
      });
      adminToast(context, done);
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _setStatus(String status) {
    final fr = context.isFrench;
    return _patch({'status': status}, fr ? 'Statut : ${registrationLabel(status, fr)}' : 'Status: ${registrationLabel(status, fr)}');
  }

  Future<void> _saveNotes() {
    final fr = context.isFrench;
    return _patch({'notes': _notes.text.trim()}, fr ? 'Note enregistrée' : 'Note saved');
  }

  Future<void> _delete() async {
    final fr = context.isFrench;
    final name = J.s(_r['full_name']);
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Retirer cette inscription ?' : 'Remove this registration?',
      message: fr
          ? 'L’inscription de $name est supprimée définitivement et sa place se libère. Pour garder une trace, choisissez plutôt « Annulée ».'
          : '$name’s registration is deleted for good and the seat is freed. To keep a record, choose “Cancelled” instead.',
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).delete(_path);
      if (!mounted) return;
      adminToast(context, fr ? 'Inscription supprimée' : 'Registration deleted');
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        adminToast(context, apiErrorText(context, e), error: true);
        setState(() => _busy = false);
      }
    }
  }

  Future<void> _launch(Uri uri) async {
    final failed = context.isFrench ? 'Impossible d’ouvrir ce lien.' : 'Could not open this link.';
    try {
      if (await launchUrl(uri, mode: LaunchMode.externalApplication)) return;
    } catch (_) {}
    if (mounted) adminToast(context, failed, error: true);
  }

  void _copy(String text) {
    Clipboard.setData(ClipboardData(text: text));
    adminToast(context, context.isFrench ? 'Copié' : 'Copied');
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final r = _r;
    final name = J.s(r['full_name']).isEmpty ? J.s(r['email']) : J.s(r['full_name']);
    final email = J.s(r['email']);
    final phone = J.s(r['phone']).trim();
    final wa = whatsAppNumber(phone);
    final message = J.s(r['message']).trim();
    // The person's own language for what is written to them.
    final theirFr = J.s(r['language']) != 'en';
    final subject = theirFr ? 'Votre inscription : ${widget.campaign.title(true)}' : 'Your registration: ${widget.campaign.title(false)}';

    return AdminPanel(
      title: name,
      subtitle: fr
          ? 'Inscription du ${AdminFmt.dateTime(context, J.date(r['created_at']))}'
          : 'Registered on ${AdminFmt.dateTime(context, J.date(r['created_at']))}',
      leading: InitialsAvatar(name, size: 44),
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            if (email.isNotEmpty)
              AdminButton(
                fr ? 'E-mail' : 'Email',
                icon: Icons.mail_outline,
                onPressed: () => _launch(Uri(scheme: 'mailto', path: email, query: 'subject=${Uri.encodeComponent(subject)}')),
              ),
            if (phone.isNotEmpty)
              AdminButton(
                fr ? 'Appeler' : 'Call',
                icon: Icons.call_outlined,
                primary: false,
                onPressed: () => _launch(Uri(scheme: 'tel', path: phone.replaceAll(RegExp(r'\s+'), ''))),
              ),
            if (wa.length >= 8) AdminButton('WhatsApp', icon: Icons.chat_outlined, primary: false, onPressed: () => _launch(Uri.parse('https://wa.me/$wa'))),
          ],
        ),
        PanelSection(fr ? 'Où en est-elle' : 'Where it stands'),
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            for (final s in registrationStatuses)
              ChoiceChip(
                key: Key('registration-status-$s'),
                avatar: Icon(registrationIcon(s), size: 16, color: s == _status ? AppColors.pureWhite : registrationColor(s)),
                label: Text(registrationLabel(s, fr)),
                selected: s == _status,
                showCheckmark: false,
                selectedColor: registrationColor(s),
                backgroundColor: AppColors.pureWhite,
                side: BorderSide(color: s == _status ? registrationColor(s) : AppColors.border),
                labelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: s == _status ? AppColors.pureWhite : AppColors.text),
                onSelected: _busy || s == _status ? null : (_) => _setStatus(s),
              ),
          ],
        ),
        Padding(
          padding: const EdgeInsets.only(top: 8),
          child: Text(registrationHint(_status, fr), style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.4)),
        ),
        PanelSection(fr ? 'Coordonnées' : 'Contact details'),
        MarketingBox(
          child: Column(
            children: [
              InfoRow(
                icon: Icons.mail_outline,
                label: fr ? 'E-mail' : 'Email',
                value: email.isEmpty ? '—' : email,
                trailing: email.isEmpty ? null : _copyButton(email),
              ),
              InfoRow(
                icon: Icons.phone_outlined,
                label: fr ? 'Téléphone' : 'Phone',
                value: phone.isEmpty ? '—' : phone,
                trailing: phone.isEmpty ? null : _copyButton(phone),
              ),
              if (J.s(r['country']).isNotEmpty) InfoRow(icon: Icons.public, label: fr ? 'Pays' : 'Country', value: J.s(r['country'])),
              if (J.s(r['level']).isNotEmpty) InfoRow(icon: Icons.signal_cellular_alt, label: fr ? 'Niveau' : 'Level', value: J.s(r['level'])),
              InfoRow(icon: Icons.translate, label: fr ? 'Langue' : 'Language', value: theirFr ? 'Français' : 'English'),
              if (J.s(r['timezone']).isNotEmpty) InfoRow(icon: Icons.schedule, label: fr ? 'Fuseau horaire' : 'Time zone', value: J.s(r['timezone'])),
            ],
          ),
        ),
        if (message.isNotEmpty) ...[
          PanelSection(fr ? 'Son message' : 'Their message'),
          MarketingBox(
            child: Text(message, style: AppTypography.bodySmall.copyWith(color: AppColors.ink, height: 1.45)),
          ),
        ],
        PanelSection(fr ? 'Notes internes' : 'Internal notes'),
        AdminField(
          key: const Key('registration-notes'),
          label: fr ? 'Appel, réponse, paiement… (visible des administrateurs)' : 'Call, answer, payment… (administrators only)',
          controller: _notes,
          maxLines: 3,
        ),
        if (_notesDirty)
          Align(
            alignment: Alignment.centerRight,
            child: AdminButton(
              fr ? 'Enregistrer la note' : 'Save the note',
              key: const Key('registration-save-notes'),
              icon: Icons.check,
              busy: _busy,
              onPressed: _saveNotes,
            ),
          ),
        PanelSection(fr ? 'D’où vient-elle' : 'Where it came from'),
        MarketingBox(
          child: Column(
            children: [
              InfoRow(
                icon: placeIcon(J.s(r['placement'])),
                label: fr ? 'Emplacement' : 'Place',
                value: placeLabel(J.s(r['placement']).isEmpty ? 'link' : J.s(r['placement']), fr),
              ),
              if (J.s(r['source_path']).isNotEmpty) InfoRow(icon: Icons.web_outlined, label: fr ? 'Page' : 'Page', value: J.s(r['source_path'])),
            ],
          ),
        ),
        const SizedBox(height: 18),
        AdminButton(
          fr ? 'Supprimer l’inscription' : 'Delete the registration',
          icon: Icons.delete_outline,
          primary: false,
          danger: true,
          onPressed: _busy ? null : _delete,
        ),
      ],
    );
  }

  Widget _copyButton(String text) => IconButton(
    tooltip: context.isFrench ? 'Copier' : 'Copy',
    icon: const Icon(Icons.copy, size: 18, color: AppColors.textMuted),
    onPressed: () => _copy(text),
  );
}
