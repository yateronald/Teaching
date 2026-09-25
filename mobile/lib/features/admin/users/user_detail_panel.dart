import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../exam_prep/assignments.dart';
import '../exam_prep/exam_common.dart';
import '../exam_prep/exam_results_screen.dart';
import 'user_editor_panel.dart';
import 'user_model.dart';

/// Everything about one account, and what an admin can do with it.
class UserDetailPanel extends ConsumerStatefulWidget {
  final AdminUser user;
  final Future<void> Function() onChanged;

  const UserDetailPanel({super.key, required this.user, required this.onChanged});

  @override
  ConsumerState<UserDetailPanel> createState() => _UserDetailPanelState();
}

class _UserDetailPanelState extends ConsumerState<UserDetailPanel> {
  late AdminUser _user = widget.user;
  bool _busy = false;

  bool get _isSelf => ref.read(authNotifierProvider).user?.id == _user.id;

  Future<void> _refreshUser() async {
    await widget.onChanged();
    try {
      final res = await ref.read(apiClientProvider).get('/users/${_user.id}');
      final data = J.map(res.data);
      final raw = data['user'] is Map ? J.map(data['user']) : data;
      if (raw.isNotEmpty && mounted) {
        setState(() => _user = AdminUser.fromJson({...raw, 'exam': raw['exam'] ?? _user.exam, 'batches': raw['batches'] ?? _user.batches}));
      }
    } catch (_) {/* the list refresh already shows the latest data */}
  }

  Future<void> _edit() async {
    final saved = await showAdminPanel<bool>(context, builder: (_) => UserEditorPanel(user: _user));
    if (saved == true) await _refreshUser();
  }

  Future<void> _reset() async {
    final fr = context.isFrench;
    var mustChange = true;
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setD) => AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          title: Text(fr ? 'Réinitialiser le mot de passe ?' : 'Reset the password?', style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                fr
                    ? 'Un nouveau mot de passe temporaire est envoyé à ${_user.email}. L’ancien cesse de fonctionner immédiatement.'
                    : 'A new temporary password is emailed to ${_user.email}. The current one stops working right away.',
                style: AppTypography.bodyMedium.copyWith(height: 1.45),
              ),
              const SizedBox(height: 10),
              CheckboxListTile(
                value: mustChange,
                onChanged: (v) => setD(() => mustChange = v ?? true),
                contentPadding: EdgeInsets.zero,
                controlAffinity: ListTileControlAffinity.leading,
                activeColor: AppColors.adminAccent,
                title: Text(
                  fr ? 'Demander un nouveau mot de passe à la prochaine connexion' : 'Ask for a new password at next sign-in',
                  style: AppTypography.bodySmall,
                ),
              ),
            ],
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(fr ? 'Annuler' : 'Cancel')),
            FilledButton.icon(
              onPressed: () => Navigator.pop(ctx, true),
              style: FilledButton.styleFrom(backgroundColor: AppColors.adminAccent),
              icon: const Icon(Icons.mail_outline, size: 18),
              label: Text(fr ? 'Réinitialiser et envoyer' : 'Reset and email'),
            ),
          ],
        ),
      ),
    );
    if (ok != true || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).put('/users/${_user.id}/reset-password', data: {'mustChange': mustChange});
      if (!mounted) return;
      adminToast(context, fr ? 'Mot de passe temporaire envoyé à ${_user.email}' : 'Temporary password sent to ${_user.email}');
      await _refreshUser();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _toggleActive() async {
    final fr = context.isFrench;
    final disabling = _user.isActive;
    if (_isSelf && disabling) {
      adminToast(context, fr ? 'Vous ne pouvez pas désactiver votre propre compte.' : 'You cannot disable your own account.', error: true);
      return;
    }
    final ok = await confirmAdmin(
      context,
      title: disabling
          ? (fr ? 'Désactiver ${_user.fullName} ?' : 'Disable ${_user.fullName}?')
          : (fr ? 'Réactiver ${_user.fullName} ?' : 'Enable ${_user.fullName}?'),
      message: disabling
          ? (fr ? 'Le compte est déconnecté et ne peut plus se connecter jusqu’à sa réactivation.' : "They are signed out and can't sign in until you enable the account again.")
          : (fr ? 'Le compte pourra se reconnecter. Les tentatives échouées sont remises à zéro.' : 'They can sign in again. Failed sign-in attempts are reset.'),
      confirmLabel: disabling ? (fr ? 'Désactiver' : 'Disable') : (fr ? 'Réactiver' : 'Enable'),
      danger: disabling,
    );
    if (!ok || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).put('/users/${_user.id}', data: {'is_active': !disabling});
      if (!mounted) return;
      adminToast(context, disabling ? (fr ? 'Compte désactivé' : 'Account disabled') : (fr ? 'Compte réactivé' : 'Account enabled'));
      await _refreshUser();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _delete() async {
    final fr = context.isFrench;
    if (_isSelf) {
      adminToast(context, fr ? 'Vous ne pouvez pas supprimer votre propre compte.' : 'You cannot delete your own account.', error: true);
      return;
    }
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer ${_user.fullName} ?' : 'Delete ${_user.fullName}?',
      message: fr
          ? 'Le compte est supprimé définitivement. Désactivez-le plutôt si vous pourriez en avoir besoin plus tard.'
          : 'This permanently removes the account. Disable it instead if you may need it later.',
      confirmLabel: fr ? 'Supprimer définitivement' : 'Delete permanently',
    );
    if (!ok || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).delete('/users/${_user.id}');
      await widget.onChanged();
      if (!mounted) return;
      adminToast(context, fr ? '${_user.fullName} a été supprimé' : '${_user.fullName} was deleted');
      Navigator.of(context).maybePop();
    } catch (e) {
      if (mounted) {
        adminToast(context, apiErrorText(context, e), error: true);
        setState(() => _busy = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final u = _user;
    return AdminPanel(
      title: u.fullName,
      subtitle: u.email,
      leading: InitialsAvatar(u.fullName, size: 44, color: u.roleColor),
      children: [
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            Pill(AdminUser.roleLabel(u.role, fr), color: u.roleColor, icon: AdminUser.roleIcon(u.role)),
            Pill(u.isActive ? (fr ? 'Actif' : 'Active') : (fr ? 'Désactivé' : 'Disabled'), color: u.isActive ? AppColors.good : AppColors.textMuted, icon: Icons.circle),
            if (u.role == 'admin' && u.canViewMonitoring) Pill(fr ? 'Suivi du site' : 'Monitoring', color: AppColors.adminAccent, icon: Icons.insights),
          ],
        ),
        const SizedBox(height: 14),
        Row(
          children: [
            Expanded(child: AdminButton(fr ? 'Modifier' : 'Edit', icon: Icons.edit_outlined, onPressed: _busy ? null : _edit)),
            const SizedBox(width: 10),
            Expanded(child: AdminButton(fr ? 'Mot de passe' : 'Password', icon: Icons.key_outlined, primary: false, onPressed: _busy ? null : _reset)),
          ],
        ),
        if (u.needsAttention) ...[
          const SizedBox(height: 14),
          _Callout(
            icon: Icons.warning_amber_rounded,
            color: AppColors.warn,
            title: fr ? '${u.failedLogins} connexions échouées' : '${u.failedLogins} failed sign-in attempts',
            text: fr
                ? 'Mot de passe oublié ? Une réinitialisation lui envoie un nouveau mot de passe temporaire.'
                : 'They may have forgotten their password. A reset emails them a new temporary one.',
          ),
        ],
        if (u.role == 'candidate') _CandidateBlock(user: u),
        if (u.role == 'student' && u.batches.isNotEmpty) ...[
          PanelSection(fr ? 'Promotions' : 'Batches'),
          Wrap(
            spacing: 6,
            runSpacing: 6,
            children: [
              for (final b in u.batches)
                Chip(
                  avatar: Pill.level(J.s(b['french_level'])),
                  label: Text(J.s(b['name'])),
                  backgroundColor: AppColors.pureWhite,
                  side: const BorderSide(color: AppColors.border),
                ),
            ],
          ),
        ],
        PanelSection(fr ? 'Informations' : 'Details'),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
          child: Column(
            children: [
              InfoRow(icon: Icons.alternate_email, label: fr ? 'Identifiant' : 'Username', value: u.username),
              InfoRow(icon: Icons.mail_outline, label: 'E-mail', value: u.email),
              InfoRow(icon: Icons.event_outlined, label: fr ? 'Inscrit le' : 'Joined', value: '${AdminFmt.day(context, u.createdAt)} · ${AdminFmt.relative(context, u.createdAt)}'),
              InfoRow(icon: Icons.tag, label: 'ID', value: '${u.id}'),
            ],
          ),
        ),
        _DevicesBlock(user: u),
        if (u.role == 'student' || u.role == 'candidate') _CreditsBlock(user: u),
        PanelSection(fr ? 'Accès au compte' : 'Account access'),
        AdminCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            children: [
              _ZoneRow(
                title: u.isActive ? (fr ? 'Désactiver le compte' : 'Disable account') : (fr ? 'Réactiver le compte' : 'Enable account'),
                text: u.isActive
                    ? (fr ? 'Empêche la connexion. Réversible à tout moment.' : 'Stops them from signing in. You can undo this anytime.')
                    : (fr ? 'Autorise de nouveau la connexion.' : 'Lets them sign in again.'),
                action: AdminButton(
                  u.isActive ? (fr ? 'Désactiver' : 'Disable') : (fr ? 'Réactiver' : 'Enable'),
                  primary: false,
                  danger: u.isActive,
                  onPressed: _busy || (_isSelf && u.isActive) ? null : _toggleActive,
                ),
              ),
              const Divider(height: 24, color: AppColors.borderSoft),
              _ZoneRow(
                title: fr ? 'Supprimer le compte' : 'Delete user',
                text: fr ? 'Suppression définitive, sans retour possible.' : 'Permanently removes the account. This cannot be undone.',
                action: AdminButton(
                  fr ? 'Supprimer' : 'Delete',
                  primary: false,
                  danger: true,
                  icon: Icons.delete_outline,
                  onPressed: _busy || _isSelf ? null : _delete,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _ZoneRow extends StatelessWidget {
  final String title;
  final String text;
  final Widget action;
  const _ZoneRow({required this.title, required this.text, required this.action});

  @override
  Widget build(BuildContext context) {
    final body = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
        const SizedBox(height: 2),
        Text(text, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
      ],
    );
    return LayoutBuilder(
      builder: (context, c) => c.maxWidth < 340
          ? Column(crossAxisAlignment: CrossAxisAlignment.start, children: [body, const SizedBox(height: 10), action])
          : Row(children: [Expanded(child: body), const SizedBox(width: 12), action]),
    );
  }
}

class _Callout extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String text;
  const _Callout({required this.icon, required this.color, required this.title, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.07),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 20),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
                const SizedBox(height: 2),
                Text(text, style: AppTypography.caption.copyWith(color: AppColors.text, height: 1.4)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

/// A candidate's exam goal, open content, practice and devices.
class _CandidateBlock extends StatelessWidget {
  final AdminUser user;
  const _CandidateBlock({required this.user});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final ex = user.exam ?? const {};
    final examDate = J.date(ex['exam_date']);
    final days = examDate?.difference(DateTime.now()).inDays;
    final lastPractice = J.date(ex['last_practice_at']);
    final nclc = ex['target_nclc'];
    final active = J.i(ex['active_items']);
    Widget fact(String label, String value, [String? sub]) => Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: AppColors.surfaceSoft, borderRadius: BorderRadius.circular(10), border: Border.all(color: AppColors.borderSoft)),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600)),
              const SizedBox(height: 3),
              Text(value, style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
              if (sub != null) Text(sub, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
            ],
          ),
        );
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PanelSection(fr ? "Préparation à l'examen" : 'Exam preparation', trailing: Pill(AdminUser.examTargets[J.s(ex['target_exam'])] ?? 'TCF Canada', color: const Color(0xFFD97706))),
        AdminGrid(
          minTileWidth: 150,
          maxColumns: 3,
          spacing: 8,
          children: [
            fact(fr ? 'Objectif' : 'Target', nclc == null ? '—' : 'NCLC $nclc'),
            fact(fr ? "Date d'examen" : 'Exam date', examDate == null ? '—' : AdminFmt.day(context, examDate),
                days != null && days >= 0 ? (fr ? 'dans $days j' : 'in $days days') : null),
            fact(fr ? 'Contenus ouverts' : 'Open content', '$active',
                ex['access_until'] != null ? (fr ? "jusqu'au ${AdminFmt.dayShort(context, J.date(ex['access_until']))}" : 'until ${AdminFmt.dayShort(context, J.date(ex['access_until']))}') : null),
            fact(fr ? 'Résultats' : 'Results', '${J.i(ex['attempts'])}',
                lastPractice == null ? (fr ? 'pas encore' : 'no practice yet') : AdminFmt.relative(context, lastPractice)),
            fact(fr ? 'Appareils' : 'Devices', '${J.i(ex['devices'])}${ex['device_limit'] != null ? ' / ${J.i(ex['device_limit'])}' : ''}'),
          ],
        ),
        if (J.s(ex['admin_notes']).isNotEmpty) ...[
          const SizedBox(height: 10),
          _Callout(icon: Icons.lock_outline, color: AppColors.textMuted, title: fr ? 'Note privée' : 'Private note', text: J.s(ex['admin_notes'])),
        ],
        if (active == 0) ...[
          const SizedBox(height: 10),
          _Callout(
            icon: Icons.warning_amber_rounded,
            color: AppColors.warn,
            title: fr ? 'Aucun contenu ouvert' : 'Nothing open yet',
            text: fr
                ? "Attribuez-lui des contenus d'examen pour qu'il puisse s'entraîner."
                : 'Assign exam content so they can practise.',
          ),
        ],
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: AdminButton(
                fr ? 'Attribuer des examens' : 'Assign exams',
                icon: Icons.track_changes,
                onPressed: () => openLevel(context, AssignContentScreen(presetCandidates: [user.id])),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: AdminButton(
                fr ? 'Voir les résultats' : 'View results',
                icon: Icons.bar_chart,
                primary: false,
                onPressed: () => openLevel(context, StudentResultsScreen(studentId: user.id)),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

/// Devices the account is signed in on, which an admin can sign out.
class _DevicesBlock extends ConsumerStatefulWidget {
  final AdminUser user;
  const _DevicesBlock({required this.user});

  @override
  ConsumerState<_DevicesBlock> createState() => _DevicesBlockState();
}

class _DevicesBlockState extends ConsumerState<_DevicesBlock> {
  Map<String, dynamic>? _data;
  String? _error;
  bool _loading = true;
  Object? _busy;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final res = await ref.read(apiClientProvider).get('/users/${widget.user.id}/sessions');
      if (mounted) {
        setState(() {
          _data = J.map(res.data);
          _error = null;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = apiErrorText(context, e);
          _loading = false;
        });
      }
    }
  }

  Future<void> _signOut([int? sessionId]) async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: sessionId == null
          ? (fr ? 'Déconnecter tous les appareils ?' : 'Sign out every device?')
          : (fr ? 'Déconnecter cet appareil ?' : 'Sign out this device?'),
      message: fr ? 'Il faudra se reconnecter sur cet appareil.' : 'They will have to sign in again on it.',
      confirmLabel: fr ? 'Déconnecter' : 'Sign out',
    );
    if (!ok || !mounted) return;
    setState(() => _busy = sessionId ?? 'all');
    try {
      final path = '/users/${widget.user.id}/sessions${sessionId == null ? '' : '/$sessionId'}';
      final res = await ref.read(apiClientProvider).delete(path);
      if (mounted) adminToast(context, J.s(J.map(res.data)['message']).isNotEmpty ? J.s(J.map(res.data)['message']) : (fr ? 'Déconnecté' : 'Signed out'));
      await _load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = null);
    }
  }

  String _since(BuildContext context, dynamic seconds) {
    final s = J.i(seconds);
    return AdminFmt.relative(context, DateTime.now().subtract(Duration(seconds: s)));
  }

  IconData _icon(String device) {
    if (RegExp('iPhone|iPad|Android', caseSensitive: false).hasMatch(device)) return Icons.smartphone;
    if (RegExp('Mac|Linux', caseSensitive: false).hasMatch(device)) return Icons.laptop_mac;
    return Icons.desktop_windows_outlined;
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final sessions = J.list(_data?['sessions']);
    final limit = _data?['limit'];
    final takeovers = J.i(_data?['takeovers_today']);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PanelSection(
          fr ? 'Appareils connectés' : 'Signed-in devices',
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(limit != null ? '${sessions.length} / ${J.i(limit)}' : '${sessions.length}',
                  style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.textMuted)),
              IconButton(
                visualDensity: VisualDensity.compact,
                tooltip: fr ? 'Actualiser' : 'Refresh',
                onPressed: _load,
                icon: const Icon(Icons.refresh, size: 18, color: AppColors.textMuted),
              ),
            ],
          ),
        ),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          child: _loading
              ? const Padding(padding: EdgeInsets.all(12), child: Center(child: SizedBox(width: 22, height: 22, child: CircularProgressIndicator(strokeWidth: 2))))
              : _error != null
                  ? Padding(padding: const EdgeInsets.all(8), child: Text(_error!, style: AppTypography.caption.copyWith(color: AppColors.bad)))
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        if (sessions.isEmpty)
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 10),
                            child: Text(
                              fr ? "Connecté sur aucun appareil en ce moment." : 'Not signed in on any device right now.',
                              style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                            ),
                          ),
                        for (final s in sessions)
                          ListTile(
                            contentPadding: EdgeInsets.zero,
                            leading: Icon(_icon(J.s(s['device'])), color: AppColors.adminAccent),
                            title: Text(J.s(s['device']), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
                            subtitle: Text(
                              [
                                '${fr ? 'actif' : 'used'} ${_since(context, s['idle_seconds'])}',
                                '${fr ? 'connecté' : 'signed in'} ${_since(context, s['age_seconds'])}',
                                if (J.s(s['ip']).isNotEmpty) J.s(s['ip']),
                              ].join(' · '),
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                            ),
                            trailing: TextButton(
                              onPressed: _busy != null ? null : () => _signOut(J.i(s['id'])),
                              style: TextButton.styleFrom(foregroundColor: AppColors.bad),
                              child: _busy == J.i(s['id'])
                                  ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2))
                                  : Text(fr ? 'Déconnecter' : 'Sign out'),
                            ),
                          ),
                        if (takeovers > 0)
                          Padding(
                            padding: const EdgeInsets.only(top: 4, bottom: 6),
                            child: Text(
                              fr
                                  ? 'A déconnecté ses autres appareils $takeovers fois en 24 h.'
                                  : 'Signed its other devices out $takeovers time${takeovers == 1 ? '' : 's'} in the last 24 h.',
                              style: AppTypography.caption.copyWith(color: AppColors.warn),
                            ),
                          ),
                        if (sessions.length > 1)
                          Align(
                            alignment: Alignment.centerLeft,
                            child: TextButton.icon(
                              onPressed: _busy != null ? null : () => _signOut(),
                              style: TextButton.styleFrom(foregroundColor: AppColors.bad),
                              icon: const Icon(Icons.logout, size: 16),
                              label: Text(fr ? 'Tout déconnecter' : 'Sign out all'),
                            ),
                          ),
                      ],
                    ),
        ),
      ],
    );
  }
}

/// AI correction credits (writing and speaking) of a student or candidate.
class _CreditsBlock extends ConsumerStatefulWidget {
  final AdminUser user;
  const _CreditsBlock({required this.user});

  @override
  ConsumerState<_CreditsBlock> createState() => _CreditsBlockState();
}

class _CreditsBlockState extends ConsumerState<_CreditsBlock> {
  Map<String, dynamic>? _balance;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final res = await ref.read(apiClientProvider).get('/ai-credits/users/${widget.user.id}');
      if (mounted) setState(() => _balance = J.map(res.data));
    } catch (_) {
      if (mounted) setState(() => _balance = const {});
    }
  }

  Future<void> _change(String type, {required bool grant}) async {
    final fr = context.isFrench;
    int? amount = grant ? 5 : null;
    if (grant) {
      amount = await showDialog<int>(
        context: context,
        builder: (ctx) {
          var value = 5;
          return StatefulBuilder(
            builder: (ctx, setD) => AlertDialog(
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              title: Text(
                type == 'ee' ? (fr ? 'Crédits expression écrite' : 'Writing credits') : (fr ? 'Crédits expression orale' : 'Speaking credits'),
                style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800),
              ),
              content: Wrap(
                spacing: 8,
                runSpacing: 8,
                children: [
                  for (final q in [1, 5, 10, 20])
                    ChoiceChip(
                      label: Text('+$q'),
                      selected: value == q,
                      selectedColor: AppColors.adminAccentBg,
                      onSelected: (_) => setD(() => value = q),
                    ),
                ],
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(ctx), child: Text(fr ? 'Annuler' : 'Cancel')),
                FilledButton(
                  onPressed: () => Navigator.pop(ctx, value),
                  style: FilledButton.styleFrom(backgroundColor: AppColors.adminAccent),
                  child: Text(fr ? 'Ajouter' : 'Grant'),
                ),
              ],
            ),
          );
        },
      );
      if (amount == null) return;
    } else {
      final ok = await confirmAdmin(
        context,
        title: fr ? 'Retirer tous les crédits ?' : 'Remove all credits?',
        message: fr ? 'Le solde de ce type revient à zéro.' : 'The balance of this type goes back to zero.',
        confirmLabel: fr ? 'Retirer' : 'Remove',
      );
      if (!ok) return;
    }
    if (!mounted) return;
    setState(() => _busy = true);
    try {
      final api = ref.read(apiClientProvider);
      if (grant) {
        await api.post('/ai-credits/grant', data: {'user_id': widget.user.id, 'type': type, 'amount': amount});
      } else {
        await api.post('/ai-credits/revoke', data: {'user_id': widget.user.id, 'type': type, 'amount': 'all', 'notes': 'Revoked by admin'});
      }
      await _load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    Widget line(String type, String label, IconData icon) {
      final value = _balance == null ? null : J.i(_balance!['${type}_credits']);
      return Row(
        children: [
          Icon(icon, size: 18, color: AppColors.adminAccent),
          const SizedBox(width: 10),
          Expanded(child: Text(label, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w600))),
          Text(value == null ? '…' : '$value', style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800)),
          const SizedBox(width: 6),
          IconButton(
            tooltip: fr ? 'Ajouter' : 'Grant',
            onPressed: _busy ? null : () => _change(type, grant: true),
            icon: const Icon(Icons.add_circle_outline, color: AppColors.adminAccent),
          ),
          IconButton(
            tooltip: fr ? 'Tout retirer' : 'Remove all',
            onPressed: _busy || (value ?? 0) == 0 ? null : () => _change(type, grant: false),
            icon: const Icon(Icons.remove_circle_outline, color: AppColors.bad),
          ),
        ],
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        PanelSection(fr ? 'Crédits de correction IA' : 'AI correction credits'),
        AdminCard(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
          child: Column(
            children: [
              line('ee', fr ? 'Expression écrite' : 'Writing (EE)', Icons.edit_note),
              const Divider(height: 1, color: AppColors.borderSoft),
              line('eo', fr ? 'Expression orale' : 'Speaking (EO)', Icons.record_voice_over_outlined),
            ],
          ),
        ),
      ],
    );
  }
}
