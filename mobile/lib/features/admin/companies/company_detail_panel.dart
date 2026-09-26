import 'package:dio/dio.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'company_editor_panel.dart';
import 'company_model.dart';
import 'company_history.dart';
import 'content_picker.dart';

/// Everything about one company: access, package, credits, allowed exams,
/// managers, learners, logo, credit history and activity.
class CompanyDetailPanel extends ConsumerStatefulWidget {
  final int companyId;
  const CompanyDetailPanel({super.key, required this.companyId});

  @override
  ConsumerState<CompanyDetailPanel> createState() => _CompanyDetailPanelState();
}

class _CompanyDetailPanelState extends ConsumerState<CompanyDetailPanel> {
  Company? _c;
  List<Map<String, dynamic>> _learners = [];
  List<Map<String, dynamic>> _moves = [];
  bool _loading = true;
  String? _error;
  bool _busy = false;
  bool _allLearners = false;

  String get _base => '/admin/organizations/${widget.companyId}';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final api = ref.read(apiClientProvider);
      final results = await Future.wait([
        api.get(_base),
        api.get('$_base/learners'),
        api.get('$_base/credits', queryParameters: {'limit': 30}),
      ]);
      if (!mounted) return;
      setState(() {
        _c = Company.fromJson(J.map(results[0].data));
        _learners = J.list(results[1].data);
        _moves = J.list(results[2].data, ['items']);
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = apiErrorText(context, e);
        _loading = false;
      });
    }
  }

  /// Runs a change, then reloads everything; errors are shown, never swallowed.
  Future<bool> _run(Future<void> Function() action, {String? done}) async {
    setState(() => _busy = true);
    try {
      await action();
      if (!mounted) return true;
      if (done != null) adminToast(context, done);
      await _load();
      return true;
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
      return false;
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  // ── Actions ─────────────────────────────────────────────────────────────

  Future<void> _extend() async {
    final c = _c!;
    final fr = context.isFrench;
    final now = DateTime.now();
    final from = (c.endsAt == null || c.endsAt!.isBefore(now)) ? now : c.endsAt!;
    final picked = await showDialog<(DateTime, String)>(context: context, builder: (_) => _ExtendDialog(company: c, from: from));
    if (picked == null || !mounted) return;
    final (until, note) = picked;
    await _run(
      () => ref.read(apiClientProvider).put(_base, data: {'access_ends_at': until.toUtc().toIso8601String(), if (note.isNotEmpty) 'note': note}),
      done: fr ? 'Accès jusqu’au ${AdminFmt.day(context, until)}' : 'Access until ${AdminFmt.day(context, until)}',
    );
  }

  Future<void> _credits() async {
    final c = _c!;
    final fr = context.isFrench;
    final r = await showDialog<Map<String, dynamic>>(context: context, builder: (_) => _CreditsDialog(company: c));
    if (r == null || !mounted) return;
    final grant = r['action'] == 'grant';
    final moved = kindsText(J.map(r['amounts']));
    await _run(
      () => ref.read(apiClientProvider).post('$_base/credits', data: r),
      done: grant
          ? (fr ? '$moved ajoutés à la réserve' : '$moved added to the reserve')
          : (fr ? '$moved retirés de la réserve' : '$moved taken back from the reserve'),
    );
  }

  Future<void> _edit() async {
    final saved = await showAdminPanel<bool>(context, builder: (_) => CompanyEditorPanel(company: _c));
    if (saved == true && mounted) await _load();
  }

  Future<void> _toggleStatus() async {
    final c = _c!;
    final fr = context.isFrench;
    final off = !c.isSuspended;
    final ok = await confirmAdmin(
      context,
      title: off ? (fr ? 'Désactiver ${c.name} ?' : 'Disable ${c.name}?') : (fr ? 'Réactiver ${c.name} ?' : 'Reactivate ${c.name}?'),
      message: off
          ? (fr
              ? 'Tous ses comptes (responsables et apprenants) sont déconnectés et ne peuvent plus se connecter. À la réactivation, chacun retrouve son état : un apprenant désactivé par l’entreprise reste désactivé.'
              : 'All its accounts (managers and learners) are signed out and cannot sign in. On reactivation each one gets its previous state back: a learner the company deactivated stays deactivated.')
          : (fr ? 'Ses comptes actifs peuvent de nouveau se connecter.' : 'Its active accounts can sign in again.'),
      confirmLabel: off ? (fr ? 'Désactiver' : 'Disable') : (fr ? 'Réactiver' : 'Reactivate'),
      danger: off,
    );
    if (!ok || !mounted) return;
    await _run(
      () => ref.read(apiClientProvider).post('$_base/status', data: {'status': off ? 'suspended' : 'active'}),
      done: off ? (fr ? 'Entreprise désactivée' : 'Company disabled') : (fr ? 'Entreprise réactivée' : 'Company reactivated'),
    );
  }

  Future<void> _delete() async {
    final c = _c!;
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer ${c.name} ?' : 'Delete ${c.name}?',
      message: fr ? 'L’entreprise n’a aucun compte. Elle sera supprimée définitivement.' : 'The company has no account. It will be deleted for good.',
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    try {
      await ref.read(apiClientProvider).delete(_base);
      if (!mounted) return;
      adminToast(context, fr ? 'Entreprise supprimée' : 'Company deleted');
      Navigator.of(context).pop(true);
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    }
  }

  Future<void> _editContent() async {
    final fr = context.isFrench;
    final picked = await pickCompanyContent(context, initial: _c!.content, title: fr ? 'Examens autorisés' : 'Allowed exams');
    if (picked == null || !mounted) return;
    await _run(
      () => ref.read(apiClientProvider).put('$_base/content', data: {
        'content': [for (final p in picked) {'content_type': p['content_type'], 'content_id': p['content_id']}],
      }),
      done: fr ? 'Examens autorisés mis à jour' : 'Allowed exams updated',
    );
  }

  Future<void> _addManager() async {
    final fr = context.isFrench;
    final person = await showDialog<Map<String, String>>(context: context, builder: (_) => const _PersonDialog());
    if (person == null || !mounted) return;
    await _run(() async {
      final res = await ref.read(apiClientProvider).post('$_base/managers', data: person);
      if (!mounted) return;
      final sent = J.map(res.data)['invitation_sent'] == true;
      adminToast(
        context,
        sent
            ? (fr ? 'Responsable ajouté : invitation envoyée par e-mail' : 'Manager added: invitation sent by email')
            : (fr ? 'Responsable ajouté, mais l’e-mail n’est pas parti : renvoyez l’invitation' : 'Manager added, but the email failed: send the invitation again'),
        error: !sent,
      );
    });
  }

  Future<void> _setActive(Map<String, dynamic> p, bool active, {required bool manager}) async {
    final fr = context.isFrench;
    final name = J.name(p);
    if (!active) {
      final ok = await confirmAdmin(
        context,
        title: fr ? 'Désactiver $name ?' : 'Deactivate $name?',
        message: manager
            ? (fr ? 'Ses sessions se terminent tout de suite.' : 'Their sessions end at once.')
            : (fr
                ? 'Ses sessions se terminent et ses crédits non utilisés reviennent dans la réserve de l’entreprise. Le compte garde sa place dans le forfait.'
                : 'Their sessions end and their unused credits go back to the company’s reserve. The account keeps its place in the package.'),
        confirmLabel: fr ? 'Désactiver' : 'Deactivate',
      );
      if (!ok || !mounted) return;
    }
    await _run(
      () => ref.read(apiClientProvider).put('$_base/accounts/${J.i(p['id'])}/active', data: {'active': active}),
      done: active ? (fr ? '$name réactivé' : '$name reactivated') : (fr ? '$name désactivé' : '$name deactivated'),
    );
  }

  Future<void> _resend(Map<String, dynamic> p) async {
    final fr = context.isFrench;
    final name = J.name(p);
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Renvoyer l’invitation ?' : 'Send the invitation again?',
      message: fr
          ? '$name reçoit un nouveau mot de passe temporaire par e-mail ; l’ancien ne fonctionne plus et ses sessions se terminent.'
          : '$name receives a new temporary password by email; the old one stops working and their sessions end.',
      confirmLabel: fr ? 'Renvoyer' : 'Send',
      danger: false,
    );
    if (!ok || !mounted) return;
    await _run(() async {
      final res = await ref.read(apiClientProvider).post('$_base/accounts/${J.i(p['id'])}/invite');
      if (!mounted) return;
      final sent = J.map(res.data)['invitation_sent'] == true;
      adminToast(context, sent ? (fr ? 'Invitation envoyée' : 'Invitation sent') : (fr ? 'L’e-mail n’a pas pu partir' : 'The email could not be sent'), error: !sent);
    });
  }

  Future<void> _uploadLogo() async {
    final fr = context.isFrench;
    final res = await FilePicker.platform.pickFiles(type: FileType.custom, allowedExtensions: ['png', 'jpg', 'jpeg', 'webp']);
    final f = res?.files.single;
    if (f == null || f.path == null || !mounted) return;
    if (f.size > 1024 * 1024) {
      adminToast(context, fr ? 'Le logo doit faire 1 Mo au plus.' : 'The logo must be 1 MB or less.', error: true);
      return;
    }
    await _run(
      () async => ref.read(apiClientProvider).post('$_base/logo', data: FormData.fromMap({'logo': await MultipartFile.fromFile(f.path!, filename: f.name)})),
      done: fr ? 'Logo mis à jour' : 'Logo updated',
    );
  }

  Future<void> _removeLogo() async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(context, title: fr ? 'Supprimer le logo ?' : 'Remove the logo?', message: fr ? 'Ses pages afficheront l’initiale de l’entreprise.' : 'Its pages will show the company’s initial.', confirmLabel: fr ? 'Supprimer' : 'Remove');
    if (!ok || !mounted) return;
    await _run(() => ref.read(apiClientProvider).delete('$_base/logo'), done: fr ? 'Logo supprimé' : 'Logo removed');
  }

  // ── Layout ──────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final c = _c;
    if (c == null) {
      return AdminPanel(
        title: fr ? 'Entreprise' : 'Company',
        children: [_loading ? const AdminLoading() : AdminError(message: _error ?? '', onRetry: _load)],
      );
    }
    return AdminPanel(
      title: c.name,
      subtitle: c.displayName != null && c.displayName != c.name ? (fr ? 'Affichée « ${c.displayName} »' : 'Shown as “${c.displayName}”') : c.slug,
      leading: CompanyLogo(company: c, size: 44),
      children: [
        Row(children: [
          Pill(c.stateLabel(fr), color: c.stateColor, icon: Icons.circle, solid: false),
          const SizedBox(width: 8),
          if (_busy) const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.adminAccent)),
        ]),
        const SizedBox(height: 10),
        ..._banners(context, c),
        _kpis(context, c),
        const SizedBox(height: 12),
        Wrap(spacing: 8, runSpacing: 8, children: [
          AdminButton(fr ? 'Prolonger l’accès' : 'Extend access', key: const Key('company-extend'), icon: Icons.event_repeat, onPressed: _busy ? null : _extend),
          AdminButton(fr ? 'Crédits' : 'Credits', key: const Key('company-credits'), icon: Icons.bolt, primary: false, onPressed: _busy ? null : _credits),
          AdminButton(fr ? 'Modifier' : 'Edit', key: const Key('company-edit'), icon: Icons.edit_outlined, primary: false, onPressed: _busy ? null : _edit),
          AdminButton(
            c.isSuspended ? (fr ? 'Réactiver' : 'Reactivate') : (fr ? 'Désactiver' : 'Disable'),
            key: const Key('company-status'),
            icon: c.isSuspended ? Icons.play_circle_outline : Icons.block,
            primary: false,
            danger: !c.isSuspended,
            onPressed: _busy ? null : _toggleStatus,
          ),
        ]),
        PanelSection(fr ? 'Accès' : 'Access'),
        _box(Column(children: [
          InfoRow(icon: Icons.event_available, label: fr ? 'Du' : 'From', value: AdminFmt.day(context, c.startsAt)),
          InfoRow(icon: Icons.event_busy, label: fr ? 'Au' : 'Until', value: AdminFmt.day(context, c.endsAt)),
          InfoRow(
            icon: Icons.link,
            label: fr ? 'Page de connexion de l’entreprise' : 'Company sign-in page',
            value: c.signInAddress,
            trailing: IconButton(
              tooltip: fr ? 'Copier' : 'Copy',
              icon: const Icon(Icons.copy, size: 18, color: AppColors.textMuted),
              onPressed: () {
                Clipboard.setData(ClipboardData(text: c.signInAddress));
                adminToast(context, fr ? 'Lien copié' : 'Link copied');
              },
            ),
          ),
          InfoRow(icon: Icons.translate, label: fr ? 'Langue par défaut' : 'Default language', value: c.language == 'en' ? 'English' : 'Français'),
          if (c.notes != null) InfoRow(icon: Icons.sticky_note_2_outlined, label: fr ? 'Notes internes' : 'Internal notes', value: c.notes!),
        ])),
        PanelSection(
          fr ? 'Examens autorisés (${c.content.length})' : 'Allowed exams (${c.content.length})',
          trailing: AdminLink(fr ? 'Modifier' : 'Change', onTap: _busy ? () {} : _editContent),
        ),
        _box(c.content.isEmpty
            ? Text(fr ? 'Aucun examen : l’entreprise ne peut rien attribuer.' : 'No exam: the company cannot assign anything.', style: AppTypography.bodySmall.copyWith(color: AppColors.bad))
            : ContentChips(c.content)),
        PanelSection(
          fr ? 'Responsables (${c.managerList.length})' : 'Managers (${c.managerList.length})',
          trailing: AdminLink(fr ? 'Ajouter' : 'Add', onTap: _busy ? () {} : _addManager),
        ),
        _box(Column(children: [
          if (c.managerList.isEmpty) Text(fr ? 'Aucun responsable.' : 'No manager.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
          for (final m in c.managerList) _person(context, m, manager: true),
        ])),
        PanelSection(fr ? 'Apprenants (${c.seatsUsed} / ${c.seatLimit})' : 'Learners (${c.seatsUsed} / ${c.seatLimit})'),
        _box(Column(children: [
          if (_learners.isEmpty)
            Text(fr ? 'L’entreprise n’a pas encore ajouté d’apprenant.' : 'The company has not added any learner yet.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
          for (final l in (_allLearners ? _learners : _learners.take(8))) _person(context, l, manager: false),
          if (!_allLearners && _learners.length > 8)
            Align(
              alignment: Alignment.centerLeft,
              child: AdminLink(fr ? 'Voir les ${_learners.length}' : 'See all ${_learners.length}', onTap: () => setState(() => _allLearners = true)),
            ),
        ])),
        PanelSection(fr ? 'Logo' : 'Logo'),
        _box(Row(children: [
          CompanyLogo(company: c, size: 52),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              fr ? 'PNG, JPEG ou WebP, 1 Mo au plus. Affiché sur sa page de connexion, dans son espace et ses e-mails.' : 'PNG, JPEG or WebP, 1 MB at most. Shown on its sign-in page, in its space and in its emails.',
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            ),
          ),
        ])),
        const SizedBox(height: 8),
        Wrap(spacing: 8, runSpacing: 8, children: [
          AdminButton(c.logoUrl == null ? (fr ? 'Ajouter un logo' : 'Add a logo') : (fr ? 'Changer' : 'Change'), icon: Icons.image_outlined, primary: false, onPressed: _busy ? null : _uploadLogo),
          if (c.logoUrl != null) AdminButton(fr ? 'Supprimer' : 'Remove', icon: Icons.delete_outline, primary: false, danger: true, onPressed: _busy ? null : _removeLogo),
        ]),
        PanelSection(fr ? 'Mouvements de crédits' : 'Credit history'),
        _box(Column(children: [
          if (_moves.isEmpty) Text(fr ? 'Aucun mouvement.' : 'No movement yet.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
          for (final m in _moves) _move(context, m),
        ])),
        PanelSection(fr ? 'Historique et audit' : 'History & audit'),
        CompanyHistorySection(company: c),
        if (c.learners == 0 && c.managerList.isEmpty) ...[
          const SizedBox(height: 18),
          AdminButton(fr ? 'Supprimer l’entreprise' : 'Delete the company', icon: Icons.delete_forever_outlined, primary: false, danger: true, onPressed: _busy ? null : _delete),
        ],
      ],
    );
  }

  List<Widget> _banners(BuildContext context, Company c) {
    final fr = context.isFrench;
    Widget banner(IconData icon, Color color, Color bg, String title, String text) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12), border: Border.all(color: color.withValues(alpha: 0.3))),
          child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 10),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(title, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: color)),
                const SizedBox(height: 2),
                Text(text, style: AppTypography.caption.copyWith(color: AppColors.text, height: 1.4)),
              ]),
            ),
          ]),
        );
    return [
      if (c.state == 'suspended')
        banner(Icons.block, AppColors.bad, AppColors.badBg, fr ? 'Entreprise désactivée' : 'Company disabled',
            fr ? 'Aucun de ses comptes ne peut se connecter. Réactivez-la pour rendre l’accès à chacun.' : 'None of its accounts can sign in. Reactivate it to give everyone their access back.'),
      if (c.state == 'expired')
        banner(Icons.event_busy, AppColors.warn, AppColors.warnBg, fr ? 'Accès terminé le ${AdminFmt.day(context, c.endsAt)}' : 'Access ended on ${AdminFmt.day(context, c.endsAt)}',
            fr
                ? 'Ses comptes peuvent se connecter et voir leurs résultats, mais examens, attributions et crédits sont fermés. Prolongez l’accès pour tout rouvrir.'
                : 'Its people can sign in and see results, but exams, assignments and credits are closed. Extend the access to reopen everything.'),
      if (c.state == 'not_started')
        banner(Icons.schedule, const Color(0xFF2563EB), AppColors.adminAccentBg, fr ? 'Accès pas encore commencé' : 'Access not started yet',
            fr ? 'Il commence le ${AdminFmt.day(context, c.startsAt)}.' : 'It starts on ${AdminFmt.day(context, c.startsAt)}.'),
      if (c.seatsLeft == 0)
        banner(Icons.group_off_outlined, AppColors.warn, AppColors.warnBg, fr ? 'Forfait complet' : 'Package full',
            fr ? 'L’entreprise ne peut plus ajouter d’apprenant. Modifiez-la pour augmenter le forfait.' : 'The company cannot add learners any more. Edit it to raise the package.'),
    ];
  }

  Widget _kpis(BuildContext context, Company c) {
    final fr = context.isFrench;
    return AdminGrid(minTileWidth: 140, maxColumns: 4, spacing: 10, children: [
      StatTile(
        label: fr ? 'Forfait' : 'Package',
        value: '${c.seatsUsed} / ${c.seatLimit}',
        sub: fr ? '${c.seatsLeft} restant(s) · ${c.activeLearners} actif(s)' : '${c.seatsLeft} left · ${c.activeLearners} active',
        icon: Icons.groups_outlined,
        color: c.seatsLeft == 0 ? AppColors.warn : AppColors.adminAccent,
      ),
      StatTile(
        label: fr ? 'Réserve EE' : 'EE reserve',
        value: '${c.ee.reserve}',
        sub: fr ? '${c.ee.withLearners} chez les apprenants · ${c.ee.used} utilisés' : '${c.ee.withLearners} with learners · ${c.ee.used} used',
        icon: Icons.edit_note,
        color: const Color(0xFFB45309),
      ),
      StatTile(
        label: fr ? 'Réserve EO' : 'EO reserve',
        value: '${c.eo.reserve}',
        sub: fr ? '${c.eo.withLearners} chez les apprenants · ${c.eo.used} utilisés' : '${c.eo.withLearners} with learners · ${c.eo.used} used',
        icon: Icons.mic_none,
        color: const Color(0xFFBE123C),
      ),
      StatTile(
        label: fr ? 'Jours restants' : 'Days left',
        value: c.isOpen ? '${c.daysLeft}' : '—',
        sub: fr ? 'jusqu’au ${AdminFmt.day(context, c.endsAt)}' : 'until ${AdminFmt.day(context, c.endsAt)}',
        icon: Icons.calendar_month_outlined,
        color: c.isOpen && !c.expiringSoon ? AppColors.good : AppColors.warn,
      ),
    ]);
  }

  Widget _box(Widget child) => Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
        child: child,
      );

  Widget _person(BuildContext context, Map<String, dynamic> p, {required bool manager}) {
    final fr = context.isFrench;
    final active = p['is_active'] == true;
    final pending = p['invitation_pending'] == true || p['must_change_password'] == true || J.i(p['must_change_password']) == 1;
    final name = J.name(p);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(children: [
        InitialsAvatar(name, size: 34),
        const SizedBox(width: 10),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(name, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: active ? AppColors.ink : AppColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
            Text(
              [
                J.s(p['email']),
                if (!manager) 'EE ${J.i(p['ee_credits'])} · EO ${J.i(p['eo_credits'])}',
              ].join(' · '),
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ]),
        ),
        if (!active)
          Pill(fr ? 'Désactivé' : 'Off', color: AppColors.textMuted)
        else if (pending)
          Pill(fr ? 'Invité' : 'Invited', color: AppColors.warn),
        PopupMenuButton<String>(
          tooltip: fr ? 'Actions' : 'Actions',
          icon: const Icon(Icons.more_vert, color: AppColors.textMuted),
          enabled: !_busy,
          onSelected: (v) {
            if (v == 'invite') _resend(p);
            if (v == 'off') _setActive(p, false, manager: manager);
            if (v == 'on') _setActive(p, true, manager: manager);
          },
          itemBuilder: (_) => [
            if (active) PopupMenuItem(value: 'invite', child: Text(fr ? 'Renvoyer l’invitation' : 'Send the invitation again')),
            if (active) PopupMenuItem(value: 'off', child: Text(fr ? 'Désactiver' : 'Deactivate', style: const TextStyle(color: AppColors.bad))),
            if (!active) PopupMenuItem(value: 'on', child: Text(fr ? 'Réactiver' : 'Reactivate')),
          ],
        ),
      ]),
    );
  }

  Widget _move(BuildContext context, Map<String, dynamic> m) {
    final fr = context.isFrench;
    final delta = J.i(m['delta']);
    final type = J.s(m['credit_type']).toUpperCase();
    final notes = J.s(m['notes']);
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        SizedBox(
          width: 64,
          child: Text(
            '${delta > 0 ? '+' : ''}$delta $type',
            style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: delta >= 0 ? AppColors.good : AppColors.bad),
          ),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(creditMoveText(m, fr), style: AppTypography.bodySmall.copyWith(color: AppColors.ink)),
            Text(
              [AdminFmt.dateTime(context, J.date(m['created_at'])), if (notes.isNotEmpty) notes].join(' · '),
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            ),
          ]),
        ),
      ]),
    );
  }
}

/// The company's logo, or its initial when it has none (or it fails to load).
class CompanyLogo extends StatelessWidget {
  final Company company;
  final double size;
  const CompanyLogo({super.key, required this.company, this.size = 40});

  @override
  Widget build(BuildContext context) {
    final initial = Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: AppColors.adminAccentBg, borderRadius: BorderRadius.circular(size * 0.25)),
      child: Text(
        company.shownName.isEmpty ? '?' : company.shownName.characters.first.toUpperCase(),
        style: AppTypography.titleMedium.copyWith(color: AppColors.adminAccent, fontWeight: FontWeight.w800, fontSize: size * 0.42),
      ),
    );
    final address = company.logoAddress;
    if (address == null) return initial;
    return Container(
      width: size,
      height: size,
      padding: EdgeInsets.all(size * 0.08),
      decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(size * 0.25), border: Border.all(color: AppColors.border)),
      child: Image.network(address, fit: BoxFit.contain, errorBuilder: (_, _, _) => initial),
    );
  }
}

/// New end date, with presets counted from the current end (or today when it is past).
class _ExtendDialog extends StatefulWidget {
  final Company company;
  final DateTime from;
  const _ExtendDialog({required this.company, required this.from});

  @override
  State<_ExtendDialog> createState() => _ExtendDialogState();
}

class _ExtendDialogState extends State<_ExtendDialog> {
  late DateTime _until = endOfDay(addMonths(widget.from, 3));
  final _note = TextEditingController();

  @override
  void dispose() {
    _note.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final c = widget.company;
    final shorter = c.endsAt != null && _until.isBefore(c.endsAt!);
    final valid = c.startsAt == null || _until.isAfter(c.startsAt!);
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(fr ? 'Prolonger l’accès' : 'Extend access', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
      content: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(
          fr
              ? 'Actuellement jusqu’au ${AdminFmt.day(context, c.endsAt)}. La nouvelle date s’applique tout de suite à l’entreprise et à tous ses apprenants.'
              : 'Currently until ${AdminFmt.day(context, c.endsAt)}. The new date applies at once to the company and all its learners.',
          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted, height: 1.4),
        ),
        const SizedBox(height: 14),
        InkWell(
          onTap: () async {
            final now = DateTime.now();
            final d = await showDatePicker(context: context, initialDate: _until, firstDate: DateTime(now.year - 1), lastDate: DateTime(now.year + 6));
            if (d != null) setState(() => _until = endOfDay(d));
          },
          child: InputDecorator(
            decoration: adminInputDecoration(fr ? 'Nouvelle date de fin' : 'New end date', suffix: const Icon(Icons.calendar_today_outlined, size: 18)),
            child: Text(AdminFmt.day(context, _until), style: AppTypography.bodyMedium),
          ),
        ),
        const SizedBox(height: 10),
        Wrap(spacing: 6, runSpacing: 6, children: [
          for (final (m, label) in [(1, fr ? '+1 mois' : '+1 month'), (3, fr ? '+3 mois' : '+3 months'), (6, fr ? '+6 mois' : '+6 months'), (12, fr ? '+1 an' : '+1 year')])
            ActionChip(
              label: Text(label),
              onPressed: () => setState(() => _until = endOfDay(addMonths(widget.from, m))),
              visualDensity: VisualDensity.compact,
              labelStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.adminAccent),
              backgroundColor: AppColors.pureWhite,
              side: const BorderSide(color: AppColors.border),
            ),
        ]),
        if (shorter) ...[
          const SizedBox(height: 10),
          Text(
            fr ? 'Cette date raccourcit l’accès actuel.' : 'This date shortens the current access.',
            style: AppTypography.caption.copyWith(color: AppColors.warn, fontWeight: FontWeight.w700),
          ),
        ],
        const SizedBox(height: 12),
        TextField(
          key: const Key('company-extend-note'),
          controller: _note,
          maxLength: 500,
          decoration: adminInputDecoration(fr ? 'Motif (facultatif), ex. contrat renouvelé' : 'Reason (optional), e.g. contract renewed'),
        ),
        Text(
          fr ? 'Enregistré dans l’historique avec l’ancienne date, la nouvelle et votre nom.' : 'Recorded in the history with the previous date, the new one and your name.',
          style: AppTypography.caption.copyWith(color: AppColors.textMuted),
        ),
      ]),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(fr ? 'Annuler' : 'Cancel')),
        FilledButton(
          onPressed: valid ? () => Navigator.pop(context, (_until, _note.text.trim())) : null,
          style: FilledButton.styleFrom(backgroundColor: AppColors.adminAccent),
          child: Text(fr ? 'Enregistrer' : 'Save'),
        ),
      ],
    );
  }
}

/// Add credits to the company's reserve, or take some back: writing (EE),
/// speaking (EO) or both at once — both move together or neither does.
class _CreditsDialog extends StatefulWidget {
  final Company company;
  const _CreditsDialog({required this.company});

  @override
  State<_CreditsDialog> createState() => _CreditsDialogState();
}

class _CreditsDialogState extends State<_CreditsDialog> {
  String _action = 'grant';
  final Set<String> _kinds = {'ee', 'eo'};
  final _amounts = {'ee': TextEditingController(text: '10'), 'eo': TextEditingController(text: '10')};
  final _notes = TextEditingController();

  @override
  void dispose() {
    for (final c in [..._amounts.values, _notes]) {
      c.dispose();
    }
    super.dispose();
  }

  CreditPot _pot(String t) => t == 'ee' ? widget.company.ee : widget.company.eo;
  int _amount(String t) => int.tryParse(_amounts[t]!.text.trim()) ?? 0;
  int _after(String t) => _action == 'grant' ? _pot(t).reserve + _amount(t) : _pot(t).reserve - _amount(t);
  bool _lineOk(String t) => _amount(t) > 0 && _amount(t) <= 100000 && _after(t) >= 0;
  List<String> get _chosen => [for (final t in const ['ee', 'eo']) if (_kinds.contains(t)) t];

  void _toggle(String t) {
    setState(() {
      if (_kinds.contains(t)) {
        if (_kinds.length > 1) _kinds.remove(t); // one kind at least
      } else {
        _kinds.add(t);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final grant = _action == 'grant';
    final ready = _chosen.every(_lineOk);
    String name(String t) => t == 'ee' ? (fr ? 'Expression écrite' : 'Writing') : (fr ? 'Expression orale' : 'Speaking');

    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(fr ? 'Crédits de la réserve' : 'Reserve credits', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
      content: SizedBox(
        width: 440,
        child: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            SegmentedButton<String>(
              segments: [
                ButtonSegment(value: 'grant', label: Text(fr ? 'Ajouter' : 'Add'), icon: const Icon(Icons.add, size: 16)),
                ButtonSegment(value: 'revoke', label: Text(fr ? 'Retirer' : 'Take back'), icon: const Icon(Icons.remove, size: 16)),
              ],
              selected: {_action},
              onSelectionChanged: (s) => setState(() => _action = s.first),
            ),
            const SizedBox(height: 14),
            Text(fr ? 'QUELS CRÉDITS · l’un ou les deux' : 'WHICH CREDITS · one or both',
                style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w800, letterSpacing: 0.6, fontSize: 11)),
            const SizedBox(height: 8),
            Row(children: [
              for (final t in const ['ee', 'eo']) ...[
                if (t == 'eo') const SizedBox(width: 8),
                Expanded(
                  child: _KindTile(
                    key: Key('company-kind-$t'),
                    code: t.toUpperCase(),
                    title: name(t),
                    note: fr ? '${_pot(t).reserve} en réserve' : '${_pot(t).reserve} in reserve',
                    icon: t == 'ee' ? Icons.edit_note : Icons.mic_none,
                    selected: _kinds.contains(t),
                    onTap: () => _toggle(t),
                  ),
                ),
              ],
            ]),
            const SizedBox(height: 14),
            Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
              for (final t in _chosen) ...[
                if (t != _chosen.first) const SizedBox(width: 10),
                Expanded(
                  child: TextField(
                    key: Key('company-credit-$t'),
                    controller: _amounts[t],
                    keyboardType: TextInputType.number,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    onChanged: (_) => setState(() {}),
                    decoration: adminInputDecoration(fr ? 'Crédits ${t.toUpperCase()}' : '${t.toUpperCase()} credits'),
                  ),
                ),
              ],
            ]),
            const SizedBox(height: 12),
            Container(
              decoration: BoxDecoration(color: AppColors.surfaceSoft, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
              child: Column(children: [
                for (final t in _chosen)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
                    child: Row(children: [
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(6), border: Border.all(color: AppColors.border)),
                        child: Text(t.toUpperCase(), style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, fontSize: 10.5, color: AppColors.textMuted)),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          _after(t) < 0
                              ? (fr ? 'La réserve n’en contient que ${_pot(t).reserve}' : 'The reserve holds only ${_pot(t).reserve}')
                              : (fr ? 'Réserve ${_pot(t).reserve} → ${_after(t)}' : 'Reserve ${_pot(t).reserve} → ${_after(t)}'),
                          style: AppTypography.bodySmall.copyWith(color: _lineOk(t) ? AppColors.text : AppColors.bad),
                        ),
                      ),
                      Text('${grant ? '+' : '−'}${_amount(t)}', style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: _lineOk(t) ? AppColors.ink : AppColors.bad)),
                      const SizedBox(width: 6),
                      Icon(_lineOk(t) ? Icons.check_circle : Icons.error, size: 16, color: _lineOk(t) ? AppColors.good : AppColors.bad),
                    ]),
                  ),
              ]),
            ),
            if (!grant) ...[
              const SizedBox(height: 6),
              Text(
                fr ? 'Les crédits déjà donnés aux apprenants ne peuvent pas être retirés ici.' : 'Credits already given to learners cannot be taken back here.',
                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              ),
            ],
            const SizedBox(height: 12),
            TextField(controller: _notes, decoration: adminInputDecoration(fr ? 'Note (facultatif), ex. n° de facture' : 'Note (optional), e.g. invoice number')),
          ]),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(fr ? 'Annuler' : 'Cancel')),
        FilledButton(
          key: const Key('company-credit-submit'),
          onPressed: ready
              ? () => Navigator.pop(context, {
                    'action': _action,
                    'amounts': {for (final t in _chosen) t: _amount(t)},
                    'notes': _notes.text.trim(),
                  })
              : null,
          style: FilledButton.styleFrom(backgroundColor: grant ? AppColors.adminAccent : AppColors.bad),
          child: Text(grant ? (fr ? 'Ajouter' : 'Add') : (fr ? 'Retirer' : 'Take back')),
        ),
      ],
    );
  }
}

/// A selectable card for one kind of credit.
class _KindTile extends StatelessWidget {
  final String code;
  final String title;
  final String note;
  final IconData icon;
  final bool selected;
  final VoidCallback onTap;
  const _KindTile({super.key, required this.code, required this.title, required this.note, required this.icon, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      checked: selected,
      button: true,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 150),
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            color: selected ? AppColors.adminAccentBg : AppColors.pureWhite,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: selected ? AppColors.adminAccent : AppColors.border, width: selected ? 1.5 : 1),
          ),
          child: Row(children: [
            Icon(icon, size: 20, color: selected ? AppColors.adminAccent : AppColors.textMuted),
            const SizedBox(width: 8),
            Expanded(
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('$title · $code', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink), maxLines: 1, overflow: TextOverflow.ellipsis),
                Text(note, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11), maxLines: 1, overflow: TextOverflow.ellipsis),
              ]),
            ),
            Icon(selected ? Icons.check_circle : Icons.radio_button_unchecked, size: 18, color: selected ? AppColors.adminAccent : AppColors.textSubtle),
          ]),
        ),
      ),
    );
  }
}

/// First name, last name and email of a new manager.
class _PersonDialog extends StatefulWidget {
  const _PersonDialog();

  @override
  State<_PersonDialog> createState() => _PersonDialogState();
}

class _PersonDialogState extends State<_PersonDialog> {
  final _form = GlobalKey<FormState>();
  final _first = TextEditingController();
  final _last = TextEditingController();
  final _email = TextEditingController();

  @override
  void dispose() {
    for (final c in [_first, _last, _email]) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    String? required(String? v) => (v ?? '').trim().isEmpty ? (fr ? 'Obligatoire' : 'Required') : null;
    return AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(fr ? 'Nouveau responsable' : 'New manager', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
      content: Form(
        key: _form,
        child: SingleChildScrollView(
          child: Column(mainAxisSize: MainAxisSize.min, children: [
            Text(
              fr ? 'Il reçoit un e-mail avec un mot de passe temporaire.' : 'They receive an email with a temporary password.',
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            ),
            const SizedBox(height: 12),
            AdminField(label: fr ? 'Prénom' : 'First name', controller: _first, validator: required),
            AdminField(label: fr ? 'Nom' : 'Last name', controller: _last, validator: required),
            AdminField(
              label: fr ? 'Adresse e-mail' : 'Email address',
              controller: _email,
              keyboardType: TextInputType.emailAddress,
              validator: (v) => RegExp(r'^[^@\s]+@[^@\s]+\.[^@\s]+$').hasMatch((v ?? '').trim()) ? null : (fr ? 'E-mail invalide' : 'Enter a valid email'),
            ),
          ]),
        ),
      ),
      actions: [
        TextButton(onPressed: () => Navigator.pop(context), child: Text(fr ? 'Annuler' : 'Cancel')),
        FilledButton(
          onPressed: () {
            if (!(_form.currentState?.validate() ?? false)) return;
            Navigator.pop(context, {'first_name': _first.text.trim(), 'last_name': _last.text.trim(), 'email': _email.text.trim()});
          },
          style: FilledButton.styleFrom(backgroundColor: AppColors.adminAccent),
          child: Text(fr ? 'Ajouter' : 'Add'),
        ),
      ],
    );
  }
}
