import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../marketing/marketing_widgets.dart' show MarketingBanner;
import 'email_detail_panel.dart';
import 'email_editor_panel.dart';
import 'email_model.dart';

/// Email campaigns: emails to students, exam candidates, people who asked for
/// a trial class and people who registered for an offer, written by the AI in
/// French and English, with what each one brought.
class EmailsScreen extends ConsumerStatefulWidget {
  const EmailsScreen({super.key});

  @override
  ConsumerState<EmailsScreen> createState() => _EmailsScreenState();
}

class _EmailsScreenState extends ConsumerState<EmailsScreen> {
  List<EmailCampaign> _emails = [];
  Map<String, dynamic> _summary = {};
  Map<String, dynamic> _meta = {};
  bool _loading = true;
  bool _notInstalled = false;
  String? _error;
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = _emails.isEmpty && !_notInstalled;
      _error = null;
    });
    try {
      final api = ref.read(apiClientProvider);
      final results = await Future.wait([api.get('/admin/email-campaigns'), api.get('/admin/email-campaigns/meta')]);
      if (!mounted) return;
      final data = J.map(results[0].data);
      setState(() {
        _emails = J.list(data, ['campaigns']).map(EmailCampaign.new).toList();
        _summary = J.map(data['summary']);
        _meta = J.map(results[1].data);
        _notInstalled = false;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _notInstalled = emailsNotInstalled(e);
        _error = apiErrorText(context, e);
        _loading = false;
      });
    }
  }

  bool _matches(EmailCampaign c, String f) => switch (f) {
    'draft' => c.isDraft,
    'live' => ['scheduled', 'sending', 'paused'].contains(c.status),
    'sent' => ['sent', 'cancelled'].contains(c.status),
    _ => true,
  };

  Future<void> _create() async {
    final id = await showAdminPanel<int>(context, tabletWidth: 680, builder: (_) => EmailEditorPanel(meta: _meta));
    if (!mounted) return;
    await _load();
    if (id != null && id > 0 && mounted) await _open(id);
  }

  Future<void> _open(int id) async {
    final next = await showAdminPanel<int>(context, tabletWidth: 680, builder: (_) => EmailDetailPanel(emailId: id, meta: _meta));
    if (!mounted) return;
    await _load();
    if (next != null && next > 0 && next != id && mounted) await _open(next);
  }

  Future<void> _sender() async {
    final saved = await showAdminPanel<bool>(context, tabletWidth: 560, builder: (_) => _SenderPanel(meta: _meta));
    if (saved == true && mounted) await _load();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_notInstalled) {
      return AdminPage(
        onRefresh: _load,
        children: [
          _header(fr),
          AdminEmpty(
            icon: Icons.build_circle_outlined,
            title: fr ? 'Les campagnes email ne sont pas encore installées' : 'Email campaigns are not installed yet',
            message: fr
                ? 'Lancez backend/database/run-email-campaigns-migration.js sur le serveur, puis revenez ici.'
                : 'Run backend/database/run-email-campaigns-migration.js on the server, then come back here.',
          ),
        ],
      );
    }
    if (_error != null && _emails.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final s = _summary;
    final list = _emails.where((c) => _matches(c, _filter)).toList();
    int count(String f) => _emails.where((c) => _matches(c, f)).length;
    final noAddress = J.s(J.map(_meta['settings'])['postal_address']).trim().isEmpty;

    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              AdminButton(fr ? 'Nouvel email' : 'New email', key: const Key('emails-new'), icon: Icons.auto_awesome, onPressed: _create),
              AdminButton(fr ? 'Expéditeur' : 'Sender details', key: const Key('emails-sender'), icon: Icons.badge_outlined, primary: false, onPressed: _sender),
            ],
          ),
          const SizedBox(height: 10),
          AdminFilterChips<String>(
            options: [
              FilterOption('all', fr ? 'Tous' : 'All', count: _emails.length),
              FilterOption('draft', fr ? 'Brouillons' : 'Drafts', count: count('draft')),
              FilterOption('live', fr ? 'Programmés et en cours' : 'Scheduled & sending', count: count('live')),
              FilterOption('sent', fr ? 'Envoyés' : 'Sent', count: count('sent')),
            ],
            selected: _filter,
            onSelected: (v) => setState(() => _filter = v),
          ),
        ],
      ),
      children: [
        _header(fr),
        if (noAddress)
          MarketingBanner(
            icon: Icons.location_on_outlined,
            color: AppColors.warn,
            title: fr ? 'Ajoutez l’adresse postale de l’école' : 'Add the school’s postal address',
            text: fr
                ? 'Chaque email doit l’afficher (loi canadienne anti-pourriel). Touchez « Expéditeur ».'
                : 'Every email must show it (Canada’s anti-spam law). Tap « Sender details ».',
          ),
        AdminGrid(
          minTileWidth: 150,
          maxColumns: 4,
          spacing: 10,
          children: [
            StatTile(
              label: fr ? 'Envoyés · 30 jours' : 'Sent · 30 days',
              value: AdminFmt.number(context, J.i(s['sent_30d'])),
              sub: J.i(s['sending']) > 0 ? (fr ? '${J.i(s['sending'])} en cours' : '${J.i(s['sending'])} sending') : (fr ? '${J.i(s['scheduled'])} programmé(s)' : '${J.i(s['scheduled'])} scheduled'),
              icon: Icons.send_outlined,
            ),
            StatTile(label: fr ? 'Ouverts' : 'Opened', value: emailRate(s['open_rate_30d'], fr: fr), sub: fr ? 'Approximatif' : 'Approximate', icon: Icons.drafts_outlined, color: AppColors.adminAccent),
            StatTile(
              label: fr ? 'Cliqués' : 'Clicked',
              value: emailRate(s['click_rate_30d'], fr: fr),
              sub: emailPeople(J.i(s['clicked_30d']), fr),
              icon: Icons.ads_click,
              color: const Color(0xFF7C3AED),
            ),
            StatTile(
              label: fr ? 'Nouvelles réponses' : 'New answers',
              value: '${J.i(s['new_responses'])}',
              sub: fr ? 'Formulaires à traiter' : 'Forms to follow up',
              icon: Icons.assignment_turned_in_outlined,
              color: J.i(s['new_responses']) > 0 ? AppColors.warn : AppColors.good,
            ),
            StatTile(
              label: fr ? 'Désinscrits' : 'Unsubscribed',
              value: '${J.i(s['unsubscribed_30d'])}',
              sub: fr ? '${J.i(_meta['suppressions'])} adresse(s) écartée(s)' : '${J.i(_meta['suppressions'])} address(es) never emailed',
              icon: Icons.person_off_outlined,
              color: AppColors.textMuted,
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (list.isEmpty)
          AdminEmpty(
            icon: Icons.mail_outline,
            title: _emails.isEmpty ? (fr ? 'Aucun email' : 'No email yet') : (fr ? 'Aucun résultat' : 'No match'),
            message: _emails.isEmpty
                ? (fr
                      ? 'Dites à l’IA à qui il s’adresse et ce que vous voulez : elle l’écrit en français et en anglais, avec un formulaire si besoin, et propose son design.'
                      : 'Tell the AI who it is for and what you want: it writes it in French and English, with a form if needed, and proposes its design.')
                : null,
          )
        else
          AdminGrid(
            minTileWidth: 300,
            maxColumns: 3,
            spacing: 12,
            children: [for (final c in list) _EmailCard(email: c, onTap: () => _open(c.id))],
          ),
      ],
    );
  }

  Widget _header(bool fr) => AdminHeader(
    overline: fr ? 'Gestion' : 'Management',
    title: fr ? 'Campagnes email' : 'Email campaigns',
    subtitle: fr
        ? 'Des emails à vos élèves, candidats, demandes de cours d’essai et inscrits, écrits par l’IA en français et en anglais.'
        : 'Emails to your students, candidates, trial requests and registrations, written by the AI in French and English.',
  );
}

class _EmailCard extends StatelessWidget {
  final EmailCampaign email;
  final VoidCallback onTap;
  const _EmailCard({required this.email, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final c = email;
    final when = c.status == 'scheduled'
        ? (fr ? 'Le ${AdminFmt.dateTime(context, c.scheduledAt)}' : 'On ${AdminFmt.dateTime(context, c.scheduledAt)}')
        : c.startedAt != null
        ? AdminFmt.dateTime(context, c.finishedAt ?? c.startedAt)
        : (fr ? 'Modifié ${AdminFmt.relative(context, c.updatedAt)}' : 'Edited ${AdminFmt.relative(context, c.updatedAt)}');
    return AdminCard(
      padding: EdgeInsets.zero,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.mail_outline, size: 20, color: AppColors.adminAccent),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(c.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                  ),
                  Pill(emailStatusLabel(c.status, fr), color: emailStatusColor(c.status)),
                ],
              ),
              const SizedBox(height: 4),
              Text(c.subject(fr), maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
              const SizedBox(height: 10),
              if (c.status == 'sending') ...[
                ClipRRect(borderRadius: BorderRadius.circular(4), child: LinearProgressIndicator(value: c.progress, minHeight: 6)),
                const SizedBox(height: 8),
              ],
              Wrap(
                spacing: 14,
                runSpacing: 4,
                children: [
                  _fact(Icons.schedule, when),
                  for (final k in ['primary', 'secondary'])
                    if (J.map(c.buttons[k])['action'] != 'none') _fact(actionIcon(J.s(J.map(c.buttons[k])['action'])), actionLabel(J.s(J.map(c.buttons[k])['action']), fr)),
                  if (c.stat('recipients') > 0) _fact(Icons.people_outline, '${c.stat('recipients')}'),
                  if (!c.isDraft) _fact(Icons.drafts_outlined, emailRate(c.stats['open_rate'], fr: fr)),
                  if (!c.isDraft) _fact(Icons.ads_click, emailRate(c.stats['click_rate'], fr: fr)),
                  if (c.stat('responses') > 0) _fact(Icons.assignment_turned_in_outlined, fr ? '${c.stat('responses')} réponse(s)' : '${c.stat('responses')} answer(s)'),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _fact(IconData icon, String text) => Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(icon, size: 14, color: AppColors.textMuted),
      const SizedBox(width: 4),
      Flexible(child: Text(text, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.caption.copyWith(color: AppColors.textMuted))),
    ],
  );
}

/// The sender's details: postal address (required on every email), replies, name.
class _SenderPanel extends ConsumerStatefulWidget {
  final Map<String, dynamic> meta;
  const _SenderPanel({required this.meta});

  @override
  ConsumerState<_SenderPanel> createState() => _SenderPanelState();
}

class _SenderPanelState extends ConsumerState<_SenderPanel> {
  late final Map<String, dynamic> _s = J.map(widget.meta['settings']);
  late final _address = TextEditingController(text: J.s(_s['postal_address']));
  late final _reply = TextEditingController(text: J.s(_s['reply_to']));
  late final _name = TextEditingController(text: J.s(_s['sender_name']));
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _address.dispose();
    _reply.dispose();
    _name.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await ref.read(apiClientProvider).put('/admin/email-campaigns/settings', data: {
        'postal_address': _address.text.trim(),
        'reply_to': _reply.text.trim(),
        'sender_name': _name.text.trim(),
      });
      if (mounted) Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = apiErrorText(context, e);
          _saving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final sender = J.map(widget.meta['sender']);
    return AdminPanel(
      title: fr ? 'Expéditeur' : 'Sender details',
      subtitle: '${J.s(sender['name'])} <${J.s(sender['email'])}>',
      actions: [
        AdminButton(fr ? 'Annuler' : 'Cancel', primary: false, onPressed: _saving ? null : () => Navigator.of(context).pop()),
        AdminButton(fr ? 'Enregistrer' : 'Save', key: const Key('sender-save'), icon: Icons.check, busy: _saving, onPressed: _saving ? null : _save),
      ],
      children: [
        if (_error != null) MarketingBanner(icon: Icons.error_outline, color: AppColors.bad, title: fr ? 'À corriger' : 'To fix', text: _error!),
        AdminField(label: fr ? 'Nom de l’expéditeur (facultatif)' : 'Sender name (optional)', controller: _name, hint: J.s(sender['name'])),
        AdminField(label: fr ? 'Les réponses vont à (facultatif)' : 'Replies go to (optional)', controller: _reply, keyboardType: TextInputType.emailAddress, hint: J.s(sender['email'])),
        AdminField(key: const Key('sender-address'), label: fr ? 'Adresse postale de l’école' : 'Postal address of the school', controller: _address, maxLines: 3),
        Text(
          fr
              ? 'Affichée en bas de chaque email. La loi canadienne anti-pourriel (LCAP) exige une adresse postale valide ; une case postale convient.'
              : 'Shown at the bottom of every email. Canada’s anti-spam law (CASL) requires a valid mailing address; a post office box works.',
          style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.4),
        ),
      ],
    );
  }
}
