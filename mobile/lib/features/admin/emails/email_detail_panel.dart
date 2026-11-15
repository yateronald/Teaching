import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../marketing/marketing_widgets.dart' show MarketingBanner;
import 'email_design_section.dart' show EmailSketch;
import 'email_editor_panel.dart';
import 'email_model.dart';

/// One email: where it stands, test it, send it now or later, follow it as it
/// goes, the answers to its form, and what it brought. Pops the id of a copy
/// to open next, 0 once deleted, or nothing.
class EmailDetailPanel extends ConsumerStatefulWidget {
  final int emailId;
  final Map<String, dynamic> meta;
  const EmailDetailPanel({super.key, required this.emailId, required this.meta});

  @override
  ConsumerState<EmailDetailPanel> createState() => _EmailDetailPanelState();
}

class _EmailDetailPanelState extends ConsumerState<EmailDetailPanel> {
  EmailCampaign? _c;
  List<Map<String, dynamic>> _links = [];
  List<Map<String, dynamic>> _bySource = [];
  List<Map<String, dynamic>> _people = [];
  List<FormAnswer> _answers = [];
  List<Map<String, dynamic>> _fields = [];
  int _peopleTotal = 0;
  String _peopleFilter = 'all';
  bool _loading = true;
  bool _busy = false;
  String? _error;
  Timer? _poll;

  String get _base => '/admin/email-campaigns/${widget.emailId}';
  Map<String, dynamic> get _pace => J.map(widget.meta['pace']);

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _poll?.cancel();
    super.dispose();
  }

  Future<void> _load() async {
    try {
      final api = ref.read(apiClientProvider);
      final res = await api.get(_base);
      final data = J.map(res.data);
      final c = EmailCampaign(J.map(data['campaign']));
      List<Map<String, dynamic>> people = [];
      int total = 0;
      if (!c.isDraft) {
        final r = await api.get('$_base/recipients', queryParameters: {'filter': _peopleFilter});
        people = J.list(r.data, ['recipients']);
        total = J.i(J.map(r.data)['total']);
      }
      List<FormAnswer> answers = [];
      List<Map<String, dynamic>> fields = c.formFields;
      if (c.usesForm || c.stat('responses') > 0) {
        final r = await api.get('$_base/responses');
        answers = J.list(r.data, ['responses']).map(FormAnswer.new).toList();
        final f = J.list(r.data, ['fields']);
        if (f.isNotEmpty) fields = f.map(formFieldCopy).toList();
      }
      if (!mounted) return;
      setState(() {
        _c = c;
        _links = J.list(data, ['links']);
        _bySource = J.list(data, ['by_source']);
        _people = people;
        _peopleTotal = total;
        _answers = answers;
        _fields = fields;
        _loading = false;
        _error = null;
      });
      // While it goes out, the figures follow every few seconds.
      _poll?.cancel();
      if (c.status == 'sending') _poll = Timer(const Duration(seconds: 4), _load);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = emailErrorText(context, e);
        _loading = false;
      });
    }
  }

  Future<void> _run(Future<void> Function() action, {String? done}) async {
    setState(() => _busy = true);
    try {
      await action();
      if (!mounted) return;
      if (done != null) adminToast(context, done);
      await _load();
    } catch (e) {
      if (mounted) adminToast(context, emailErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _post(String path, String done, [Map<String, dynamic>? body]) =>
      _run(() => ref.read(apiClientProvider).post('$_base/$path', data: body), done: done);

  Future<void> _edit() async {
    final saved = await showAdminPanel<int>(context, tabletWidth: 680, builder: (_) => EmailEditorPanel(campaign: _c, meta: widget.meta));
    if (saved != null && mounted) await _load();
  }

  Future<void> _test() async {
    final fr = context.isFrench;
    final to = TextEditingController(text: ref.read(authNotifierProvider).user?.email ?? '');
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Envoyer un test' : 'Send a test',
      message: fr
          ? 'Un email « [TEST] » par version, à l’adresse ci-dessous. Les liens ne sont pas comptés ; le formulaire s’ouvre en aperçu (rien n’est enregistré).'
          : 'One « [TEST] » email per version, to the address below. Links are not counted; the form opens in preview (nothing is kept).',
      confirmLabel: fr ? 'Envoyer le test' : 'Send the test',
      danger: false,
      content: AdminField(key: const Key('email-test-to'), label: fr ? 'Adresse' : 'Address', controller: to, keyboardType: TextInputType.emailAddress),
    );
    if (!ok || !mounted) return;
    await _post('test', fr ? 'Test envoyé : regardez la boîte de réception (et les indésirables)' : 'Test sent: check the inbox (and the spam folder)', {'to': to.text});
  }

  Future<void> _send({DateTime? at}) async {
    final fr = context.isFrench;
    final c = _c!;
    final res = await ref.read(apiClientProvider).post('/admin/email-campaigns/audience', data: {'audience': c.audience, 'excluded': c.excluded});
    if (!mounted) return;
    final n = J.i(J.map(J.map(res.data)['counts'])['total']);
    final perMinute = J.i(_pace['per_minute']);
    final ok = await confirmAdmin(
      context,
      title: at == null ? (fr ? 'Envoyer à ${emailPeople(n, fr)} ?' : 'Send to ${emailPeople(n, fr)}?') : (fr ? 'Programmer pour ${emailPeople(n, fr)} ?' : 'Schedule for ${emailPeople(n, fr)}?'),
      message: at == null
          ? (fr ? 'Environ $perMinute emails par minute. Vous pouvez mettre en pause à tout moment.' : 'About $perMinute emails a minute. You can pause at any time.')
          : (fr ? 'Il partira seul le ${AdminFmt.dateTime(context, at)}.' : 'It goes out by itself on ${AdminFmt.dateTime(context, at)}.'),
      confirmLabel: at == null ? (fr ? 'Envoyer' : 'Send') : (fr ? 'Programmer' : 'Schedule'),
      danger: false,
    );
    if (!ok || !mounted) return;
    await _post(
      'send',
      at == null ? (fr ? 'Envoi en cours' : 'Sending') : (fr ? 'Programmé' : 'Scheduled'),
      at == null ? {} : {'scheduled_at': at.toUtc().toIso8601String()},
    );
  }

  Future<void> _schedule() async {
    final now = DateTime.now();
    final day = await showDatePicker(context: context, initialDate: now.add(const Duration(days: 1)), firstDate: now, lastDate: now.add(const Duration(days: 90)));
    if (day == null || !mounted) return;
    final time = await showTimePicker(context: context, initialTime: const TimeOfDay(hour: 9, minute: 0));
    if (time == null || !mounted) return;
    await _send(at: DateTime(day.year, day.month, day.day, time.hour, time.minute));
  }

  Future<void> _cancel() async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Annuler cet email ?' : 'Cancel this email?',
      message: fr
          ? 'Les personnes qui ne l’ont pas encore reçu ne le recevront pas. Dupliquez-le pour l’envoyer de nouveau.'
          : 'People who have not received it yet will not receive it. Duplicate it to send it again.',
      confirmLabel: fr ? 'Annuler l’email' : 'Cancel the email',
    );
    if (ok && mounted) await _post('cancel', fr ? 'Email annulé' : 'Email cancelled');
  }

  Future<void> _duplicate() async {
    final fr = context.isFrench;
    setState(() => _busy = true);
    try {
      final res = await ref.read(apiClientProvider).post('$_base/duplicate');
      if (!mounted) return;
      adminToast(context, fr ? 'Copie créée en brouillon' : 'Copy created as a draft');
      Navigator.of(context).pop(J.i(J.map(J.map(res.data)['campaign'])['id']));
    } catch (e) {
      if (mounted) {
        adminToast(context, emailErrorText(context, e), error: true);
        setState(() => _busy = false);
      }
    }
  }

  Future<void> _delete() async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer ce brouillon ?' : 'Delete this draft?',
      message: fr ? 'Il sera supprimé définitivement.' : 'It will be deleted for good.',
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).delete(_base);
      if (mounted) Navigator.of(context).pop(0);
    } catch (e) {
      if (mounted) adminToast(context, emailErrorText(context, e), error: true);
    }
  }

  Future<void> _openPreview(String lang) async {
    final fr = context.isFrench;
    try {
      final res = await ref.read(apiClientProvider).post('$_base/preview-link', data: {'lang': lang});
      final uri = Uri.tryParse(J.s(J.map(res.data)['url']));
      if (uri != null && !await launchUrl(uri, mode: LaunchMode.inAppBrowserView) && mounted) {
        adminToast(context, fr ? 'Impossible d’ouvrir l’aperçu.' : 'The preview could not be opened.', error: true);
      }
    } catch (e) {
      if (mounted) adminToast(context, emailErrorText(context, e), error: true);
    }
  }

  Future<void> _openAnswer(FormAnswer a) async {
    final changed = await showAdminPanel<bool>(
      context,
      tabletWidth: 560,
      builder: (_) => _AnswerPanel(base: _base, answer: a, fields: _fields),
    );
    if (changed == true && mounted) await _load();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final c = _c;
    if (c == null) {
      return AdminPanel(
        title: fr ? 'Email' : 'Email',
        children: [if (_loading) const AdminLoading() else AdminError(message: _error ?? '', onRetry: _load)],
      );
    }
    VoidCallback? idle(VoidCallback a) => _busy ? null : a;
    final s = c.stats;
    final perMinute = J.i(_pace['per_minute']);
    final queued = c.stat('queued');
    final missing = c.isDraft ? emailMissing(c.raw, fr, postalAddress: J.s(J.map(widget.meta['settings'])['postal_address'])) : <String>[];
    final buttons = c.buttons;
    final fresh = _answers.where((a) => a.status == 'new').length;

    return AdminPanel(
      title: c.name,
      subtitle: c.subject(fr),
      leading: SizedBox(width: 44, child: EmailSketch(design: c.design)),
      children: [
        Wrap(
          spacing: 8,
          runSpacing: 6,
          crossAxisAlignment: WrapCrossAlignment.center,
          children: [
            Pill(emailStatusLabel(c.status, fr), color: emailStatusColor(c.status), icon: Icons.circle),
            for (final k in ['primary', 'secondary'])
              if (J.map(buttons[k])['action'] != 'none') Pill(actionLabel(J.s(J.map(buttons[k])['action']), fr), color: AppColors.textMuted, icon: actionIcon(J.s(J.map(buttons[k])['action']))),
            if (_busy) const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.adminAccent)),
          ],
        ),
        const SizedBox(height: 10),
        if (missing.isNotEmpty)
          MarketingBanner(
            icon: Icons.checklist,
            color: AppColors.warn,
            title: fr ? 'Avant l’envoi' : 'Before sending',
            text: fr ? 'Ajoutez ${missing.join(', ')}.' : 'Add ${missing.join(', ')}.',
          ),
        if (c.status == 'scheduled')
          MarketingBanner(
            icon: Icons.schedule,
            color: AppColors.adminAccent,
            title: fr ? 'Programmé' : 'Scheduled',
            text: fr
                ? 'Il partira seul le ${AdminFmt.dateTime(context, c.scheduledAt)} vers ${emailPeople(c.stat('recipients'), fr)}.'
                : 'It goes out by itself on ${AdminFmt.dateTime(context, c.scheduledAt)} to ${emailPeople(c.stat('recipients'), fr)}.',
          ),
        if (c.note == 'daily_limit')
          MarketingBanner(
            icon: Icons.hourglass_bottom,
            color: AppColors.adminAccent,
            title: fr ? 'Quota du jour atteint' : 'Daily allowance reached',
            text: fr ? 'La suite part demain, toute seule.' : 'The rest goes out tomorrow, by itself.',
          ),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            if (c.isDraft) ...[
              AdminButton(fr ? 'Modifier' : 'Edit', key: const Key('email-edit'), icon: Icons.edit_outlined, primary: false, onPressed: idle(_edit)),
              AdminButton(fr ? 'Envoyer un test' : 'Send a test', key: const Key('email-test'), icon: Icons.science_outlined, primary: false, onPressed: idle(_test)),
              AdminButton(fr ? 'Envoyer' : 'Send', key: const Key('email-send'), icon: Icons.send, onPressed: missing.isEmpty ? idle(() => _send()) : null),
              AdminButton(fr ? 'Programmer' : 'Schedule', key: const Key('email-schedule'), icon: Icons.schedule, primary: false, onPressed: missing.isEmpty ? idle(_schedule) : null),
            ],
            if (c.status == 'scheduled')
              AdminButton(fr ? 'Repasser en brouillon' : 'Back to draft', icon: Icons.edit_note, primary: false, onPressed: idle(() => _post('unschedule', fr ? 'Revenu en brouillon' : 'Back to draft'))),
            if (c.status == 'sending')
              AdminButton(fr ? 'Pause' : 'Pause', key: const Key('email-pause'), icon: Icons.pause_circle_outline, primary: false, onPressed: idle(() => _post('pause', fr ? 'En pause' : 'Paused'))),
            if (c.status == 'paused')
              AdminButton(fr ? 'Reprendre' : 'Resume', key: const Key('email-resume'), icon: Icons.play_circle_outline, onPressed: idle(() => _post('resume', fr ? 'Envoi repris' : 'Sending again'))),
            if (['sending', 'paused', 'scheduled'].contains(c.status))
              AdminButton(fr ? 'Annuler l’envoi' : 'Cancel', icon: Icons.stop_circle_outlined, primary: false, danger: true, onPressed: idle(_cancel)),
            if (c.stat('failed') > 0 && ['sending', 'paused', 'sent'].contains(c.status))
              AdminButton(fr ? 'Renvoyer les échecs' : 'Retry failed', icon: Icons.replay, primary: false, onPressed: idle(() => _post('retry', fr ? 'Renvoyés' : 'Sent again'))),
            AdminButton(fr ? 'Dupliquer' : 'Duplicate', icon: Icons.copy_all_outlined, primary: false, onPressed: idle(_duplicate)),
            AdminButton(
              fr ? 'Voir l’email' : 'See the email',
              key: const Key('email-open-preview'),
              icon: Icons.visibility_outlined,
              primary: false,
              onPressed: idle(() => _openPreview(c.languageMode == 'both' ? 'both' : (c.languageMode == 'en' || (c.languageMode == 'auto' && c.defaultLang == 'en') ? 'en' : 'fr'))),
            ),
            if (c.isDraft) AdminButton(fr ? 'Supprimer' : 'Delete', icon: Icons.delete_outline, primary: false, danger: true, onPressed: idle(_delete)),
          ],
        ),
        if (c.status == 'sending' || c.status == 'paused') ...[
          const SizedBox(height: 14),
          Text(
            fr
                ? '${c.stat('recipients') - queued} sur ${c.stat('recipients')} envoyés · environ $perMinute par minute'
                : '${c.stat('recipients') - queued} of ${c.stat('recipients')} sent · about $perMinute a minute',
            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              key: const Key('email-progress'),
              value: c.progress,
              minHeight: 8,
              backgroundColor: AppColors.border,
              valueColor: AlwaysStoppedAnimation(c.status == 'paused' ? AppColors.warn : AppColors.adminAccent),
            ),
          ),
        ],
        if (!c.isDraft) ...[
          const SizedBox(height: 14),
          AdminGrid(
            minTileWidth: 140,
            maxColumns: 4,
            spacing: 10,
            children: [
              StatTile(
                label: fr ? 'Envoyés' : 'Sent',
                value: '${c.stat('sent')} / ${c.stat('recipients')}',
                sub: c.stat('failed') + c.stat('bounced') > 0
                    ? (fr ? '${c.stat('failed')} échec(s) · ${c.stat('bounced')} rejeté(s)' : '${c.stat('failed')} failed · ${c.stat('bounced')} bounced')
                    : (fr ? 'Aucun échec' : 'No failure'),
                icon: Icons.send_outlined,
                color: c.stat('failed') + c.stat('bounced') > 0 ? AppColors.warn : AppColors.good,
              ),
              StatTile(
                label: fr ? 'Ouverts' : 'Opened',
                value: emailRate(s['open_rate'], fr: fr),
                sub: '${emailPeople(c.stat('opened'), fr)} · ${fr ? 'approximatif' : 'approximate'}',
                icon: Icons.drafts_outlined,
                color: AppColors.adminAccent,
              ),
              StatTile(label: fr ? 'Cliqués' : 'Clicked', value: emailRate(s['click_rate'], fr: fr), sub: emailPeople(c.stat('clicked'), fr), icon: Icons.ads_click, color: const Color(0xFF7C3AED)),
              if (c.usesForm)
                StatTile(
                  label: fr ? 'Réponses' : 'Answers',
                  value: '${c.stat('responses')}',
                  sub: fr ? '${emailRate(s['response_rate'], fr: fr)} des destinataires' : '${emailRate(s['response_rate'])} of recipients',
                  icon: Icons.assignment_turned_in_outlined,
                  color: AppColors.good,
                ),
              StatTile(
                label: fr ? 'Désinscrits' : 'Unsubscribed',
                value: '${c.stat('unsubscribed')}',
                sub: emailRate(s['unsubscribe_rate'], fr: fr),
                icon: Icons.person_off_outlined,
                color: AppColors.textMuted,
              ),
            ],
          ),
        ],

        // The answers to the form.
        if (c.usesForm || _answers.isNotEmpty) ...[
          PanelSection(fr ? 'Réponses (${_answers.length})${fresh > 0 ? ' · $fresh nouvelle(s)' : ''}' : 'Answers (${_answers.length})${fresh > 0 ? ' · $fresh new' : ''}'),
          if (_answers.isEmpty)
            AdminEmpty(
              icon: Icons.assignment_outlined,
              title: fr ? 'Pas encore de réponse' : 'No answer yet',
              message: fr
                  ? 'Quand quelqu’un remplit le formulaire, ses réponses arrivent ici et vous recevez une notification.'
                  : 'When someone fills the form, their answers arrive here and you get a notification.',
            )
          else
            for (final a in _answers) _answerTile(fr, a),
        ],

        if (!c.isDraft) ...[
          if (_links.isNotEmpty) ...[
            PanelSection(fr ? 'Liens' : 'Links'),
            for (final l in _links)
              InfoRow(
                icon: l['url'] == 'form' ? Icons.assignment_outlined : Icons.link,
                label: l['url'] == 'form'
                    ? (fr ? 'Le formulaire' : 'The form')
                    : J.s(l['label']).isEmpty
                    ? (fr ? 'Lien ${J.i(l['idx'])}' : 'Link ${J.i(l['idx'])}')
                    : J.s(l['label']),
                value: fr ? '${emailPeople(J.i(l['people']), fr)} · ${J.i(l['clicks'])} clic(s)' : '${emailPeople(J.i(l['people']), fr)} · ${J.i(l['clicks'])} click(s)',
              ),
          ],
          if (_bySource.isNotEmpty) ...[
            PanelSection(fr ? 'Par liste' : 'By list'),
            for (final b in _bySource)
              InfoRow(
                icon: sourceIcon(J.s(b['source'])),
                label: sourceLabel(J.s(b['source']), fr),
                value: fr
                    ? '${J.i(b['recipients'])} reçu(s) · ${J.i(b['opened'])} ouvert(s) · ${J.i(b['clicked'])} clic(s)'
                    : '${J.i(b['recipients'])} received · ${J.i(b['opened'])} opened · ${J.i(b['clicked'])} clicked',
              ),
          ],
          PanelSection(fr ? 'Destinataires ($_peopleTotal)' : 'Recipients ($_peopleTotal)'),
          AdminFilterChips<String>(
            options: [
              FilterOption('all', fr ? 'Tous' : 'Everyone'),
              FilterOption('opened', fr ? 'Ouvert' : 'Opened'),
              FilterOption('clicked', fr ? 'Cliqué' : 'Clicked'),
              FilterOption('not_opened', fr ? 'Pas ouvert' : 'Not opened'),
              FilterOption('failed', fr ? 'Échec' : 'Failed'),
            ],
            selected: _peopleFilter,
            onSelected: (v) {
              setState(() => _peopleFilter = v);
              _load();
            },
          ),
          const SizedBox(height: 6),
          if (_people.isEmpty)
            AdminEmpty(icon: Icons.inbox_outlined, title: fr ? 'Personne ici' : 'Nobody here')
          else
            for (final p in _people)
              ListTile(
                contentPadding: EdgeInsets.zero,
                dense: true,
                leading: Icon(sourceIcon(J.s(p['source'])), color: AppColors.textMuted),
                title: Text(J.s(p['name']).isEmpty ? J.s(p['email']) : J.s(p['name']), maxLines: 1, overflow: TextOverflow.ellipsis),
                subtitle: Text(
                  [
                    J.s(p['email']),
                    recipientStatusLabel(J.s(p['status']), fr),
                    if (p['opened_at'] != null) fr ? 'ouvert' : 'opened',
                    if (p['clicked_at'] != null) fr ? 'a cliqué' : 'clicked',
                    if (p['unsubscribed_at'] != null) fr ? 'désinscrit' : 'unsubscribed',
                    if (J.s(p['error']).isNotEmpty) J.s(p['error']),
                  ].join(' · '),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
        ],
      ],
    );
  }

  Widget _answerTile(bool fr, FormAnswer a) {
    final summary = _fields
        .where((f) => !['name', 'email', 'phone'].contains(f['type']) && a.answer(J.s(f['id'])).isNotEmpty)
        .map((f) => '${fieldLabel(f, fr)} : ${a.answer(J.s(f['id']))}')
        .join(' · ');
    return Card(
      key: Key('email-answer-${a.id}'),
      margin: const EdgeInsets.only(bottom: 8),
      elevation: 0,
      color: a.status == 'new' ? AppColors.adminAccent.withValues(alpha: 0.05) : AppColors.pureWhite,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: const BorderSide(color: AppColors.border)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => _openAnswer(a),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(a.name.isEmpty ? a.email : a.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                  ),
                  Pill(responseStatusLabel(a.status, fr), color: responseStatusColor(a.status)),
                ],
              ),
              Text(
                [a.email, ?a.phone, AdminFmt.dateTime(context, a.createdAt)].join(' · '),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              ),
              if (summary.isNotEmpty) ...[
                const SizedBox(height: 4),
                Text(summary, maxLines: 2, overflow: TextOverflow.ellipsis, style: AppTypography.caption.copyWith(color: AppColors.text)),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// One answer to the form: every answer, the ways to reach the person, the
/// follow-up (new, contacted, done) and the team's notes. Pops true when it changed.
class _AnswerPanel extends ConsumerStatefulWidget {
  final String base;
  final FormAnswer answer;
  final List<Map<String, dynamic>> fields;
  const _AnswerPanel({required this.base, required this.answer, required this.fields});

  @override
  ConsumerState<_AnswerPanel> createState() => _AnswerPanelState();
}

class _AnswerPanelState extends ConsumerState<_AnswerPanel> {
  late String _status = widget.answer.status;
  late final _notes = TextEditingController(text: widget.answer.notes);
  bool _changed = false;
  bool _saving = false;

  FormAnswer get _a => widget.answer;

  @override
  void dispose() {
    _notes.dispose();
    super.dispose();
  }

  Future<void> _patch(Map<String, dynamic> body, String done) async {
    setState(() => _saving = true);
    try {
      await ref.read(apiClientProvider).patch('${widget.base}/responses/${_a.id}', data: body);
      _changed = true;
      if (mounted) adminToast(context, done);
    } catch (e) {
      if (mounted) adminToast(context, emailErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _open(Uri uri) async {
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) && mounted) {
      adminToast(context, context.isFrench ? 'Impossible d’ouvrir.' : 'This could not be opened.', error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final phone = _a.phone;
    final digits = phone?.replaceAll(RegExp(r'[^\d]'), '') ?? '';
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop) Navigator.of(context).pop(_changed);
      },
      child: AdminPanel(
        title: _a.name.isEmpty ? _a.email : _a.name,
        subtitle: '${AdminFmt.dateTime(context, _a.createdAt)} · ${_a.lang.toUpperCase()}${_a.source == null ? '' : ' · ${sourceLabel(_a.source!, fr)}'}',
        actions: [AdminButton(fr ? 'Terminé' : 'Done', key: const Key('email-answer-done'), onPressed: () => Navigator.of(context).pop(_changed))],
        children: [
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              AdminButton('Email', icon: Icons.mail_outline, primary: false, onPressed: () => _open(Uri(scheme: 'mailto', path: _a.email))),
              if (phone != null) AdminButton(fr ? 'Appeler' : 'Call', icon: Icons.call_outlined, primary: false, onPressed: () => _open(Uri(scheme: 'tel', path: phone))),
              if (digits.length >= 6) AdminButton('WhatsApp', icon: Icons.forum_outlined, primary: false, onPressed: () => _open(Uri.parse('https://wa.me/$digits'))),
            ],
          ),
          PanelSection(fr ? 'Ses réponses' : 'Their answers'),
          InfoRow(icon: Icons.alternate_email, label: 'Email', value: _a.email),
          if (phone != null) InfoRow(icon: Icons.phone_outlined, label: fr ? 'Téléphone' : 'Phone', value: phone),
          for (final f in widget.fields.where((f) => !['name', 'email', 'phone'].contains(f['type'])))
            InfoRow(icon: Icons.chat_bubble_outline, label: fieldLabel(f, fr), value: _a.answer(J.s(f['id'])).isEmpty ? '—' : _a.answer(J.s(f['id']))),
          PanelSection(fr ? 'Suivi' : 'Follow-up'),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              for (final st in emailResponseStatuses)
                ChoiceChip(
                  key: Key('email-answer-status-$st'),
                  label: Text(responseStatusLabel(st, fr)),
                  selected: _status == st,
                  onSelected: _saving
                      ? null
                      : (_) {
                          setState(() => _status = st);
                          _patch({'status': st}, fr ? 'Suivi enregistré' : 'Follow-up saved');
                        },
                ),
            ],
          ),
          const SizedBox(height: 12),
          AdminField(key: const Key('email-answer-notes'), label: fr ? 'Notes (visibles par l’équipe seulement)' : 'Notes (only the team sees them)', controller: _notes, maxLines: 4),
          Align(
            alignment: Alignment.centerLeft,
            child: AdminButton(
              fr ? 'Enregistrer les notes' : 'Save the notes',
              key: const Key('email-answer-save-notes'),
              icon: Icons.check,
              primary: false,
              busy: _saving,
              onPressed: _saving ? null : () => _patch({'notes': _notes.text.trim()}, fr ? 'Notes enregistrées' : 'Notes saved'),
            ),
          ),
        ],
      ),
    );
  }
}
