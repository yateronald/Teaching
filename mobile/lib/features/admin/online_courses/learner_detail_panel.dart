import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'online_courses_model.dart';

/// Shared form for activating or changing a Standard / Premium license
/// (used inside [LearnerDetailPanel] and the Company plan modal).
class GrantPlanForm extends StatefulWidget {
  final String initialTier;
  final DateTime? initialEnd;
  final bool defaultNoEnd;
  final bool busy;
  final String? submitLabel;
  final Future<void> Function(String tier, String? endsAtIso, String reason) onSubmit;

  const GrantPlanForm({
    super.key,
    this.initialTier = 'premium',
    this.initialEnd,
    this.defaultNoEnd = false,
    required this.busy,
    this.submitLabel,
    required this.onSubmit,
  });

  @override
  State<GrantPlanForm> createState() => _GrantPlanFormState();
}

class _GrantPlanFormState extends State<GrantPlanForm> {
  late String _tier = widget.initialTier == 'standard' ? 'standard' : 'premium';
  late DateTime? _end = widget.initialEnd ?? _addMonths(DateTime.now(), 1);
  late bool _noEnd = widget.defaultNoEnd;
  final _reason = TextEditingController();

  static DateTime _addMonths(DateTime d, int months) {
    final targetMonth = d.month + months;
    final y = d.year + ((targetMonth - 1) ~/ 12);
    final m = ((targetMonth - 1) % 12) + 1;
    final maxDay = DateTime(y, m + 1, 0).day;
    return DateTime(y, m, d.day.clamp(1, maxDay), 23, 59, 59);
  }

  @override
  void dispose() {
    _reason.dispose();
    super.dispose();
  }

  void _pickPreset(int months) {
    setState(() {
      _noEnd = false;
      _end = _addMonths(DateTime.now(), months);
    });
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final minDate = DateTime(now.year, now.month, now.day).add(const Duration(days: 1));
    final initial = _end != null && !_end!.isBefore(minDate) ? _end! : minDate.add(const Duration(days: 29));
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: minDate,
      lastDate: DateTime(now.year + 10, now.month, now.day),
    );
    if (picked == null || !mounted) return;
    setState(() {
      _noEnd = false;
      _end = DateTime(picked.year, picked.month, picked.day, 23, 59, 59);
    });
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final buttonText = widget.submitLabel ??
        (_tier == 'standard'
            ? (fr ? 'Activer Standard' : 'Activate Standard')
            : (fr ? 'Activer Premium' : 'Activate Premium'));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SegmentedButton<String>(
          showSelectedIcon: false,
          selected: {_tier},
          onSelectionChanged: widget.busy ? null : (v) => setState(() => _tier = v.first),
          segments: [
            ButtonSegment(
              value: 'standard',
              label: Text(fr ? 'Standard (Cours)' : 'Standard (Courses)', overflow: TextOverflow.ellipsis),
            ),
            ButtonSegment(
              value: 'premium',
              label: Text(fr ? 'Premium (Cours + Examens)' : 'Premium (Courses + Exams)', overflow: TextOverflow.ellipsis),
            ),
          ],
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 6,
          children: [
            _presetChip(fr ? '+1 mois' : '+1 month', () => _pickPreset(1)),
            _presetChip(fr ? '+3 mois' : '+3 months', () => _pickPreset(3)),
            _presetChip(fr ? '+1 an' : '+1 year', () => _pickPreset(12)),
            _presetChip(fr ? 'Sans fin' : 'No end date', () => setState(() => _noEnd = true), selected: _noEnd),
          ],
        ),
        const SizedBox(height: 10),
        Row(
          children: [
            Expanded(
              child: InkWell(
                onTap: widget.busy || _noEnd ? null : _pickDate,
                borderRadius: BorderRadius.circular(10),
                child: InputDecorator(
                  decoration: adminInputDecoration(fr ? 'Date de fin' : 'End date'),
                  child: Row(
                    children: [
                      const Icon(Icons.event_outlined, size: 17, color: AppColors.textMuted),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          _noEnd ? (fr ? 'Illimité / Sans fin' : 'Lifetime / No end') : AdminFmt.day(context, _end),
                          style: AppTypography.bodyMedium.copyWith(color: _noEnd ? AppColors.textMuted : AppColors.ink),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            const SizedBox(width: 8),
            InkWell(
              onTap: widget.busy ? null : () => setState(() => _noEnd = !_noEnd),
              borderRadius: BorderRadius.circular(8),
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Checkbox(
                      value: _noEnd,
                      onChanged: widget.busy ? null : (v) => setState(() => _noEnd = v == true),
                      visualDensity: VisualDensity.compact,
                    ),
                    Text(fr ? 'Illimité' : 'No end', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600)),
                  ],
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        AdminField(
          label: fr ? 'Motif (optionnel)' : 'Reason (optional)',
          controller: _reason,
          hint: fr ? 'ex. virement bancaire, bourse' : 'e.g. bank transfer, scholarship',
        ),
        AdminButton(
          buttonText,
          icon: _tier == 'premium' ? Icons.workspace_premium_outlined : Icons.layers_outlined,
          busy: widget.busy,
          onPressed: (!_noEnd && _end == null)
              ? null
              : () => widget.onSubmit(
                    _tier,
                    _noEnd ? null : _end!.toUtc().toIso8601String(),
                    _reason.text.trim(),
                  ),
        ),
      ],
    );
  }

  Widget _presetChip(String label, VoidCallback onTap, {bool selected = false}) => ActionChip(
        label: Text(label, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: selected ? AppColors.adminAccent : AppColors.text)),
        backgroundColor: selected ? AppColors.adminAccentBg : AppColors.surfaceSoft,
        side: BorderSide(color: selected ? AppColors.adminAccent : AppColors.border),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
        visualDensity: VisualDensity.compact,
        onPressed: widget.busy ? null : onTap,
      );
}

/// Detail panel for a single website learner or portal account: profile,
/// quick email/WhatsApp contact, current access, plan activation/revocation,
/// portal access, account suspension, and access history timeline.
class LearnerDetailPanel extends ConsumerStatefulWidget {
  final int userId;
  final VoidCallback onChanged;

  const LearnerDetailPanel({super.key, required this.userId, required this.onChanged});

  @override
  ConsumerState<LearnerDetailPanel> createState() => _LearnerDetailPanelState();
}

class _LearnerDetailPanelState extends ConsumerState<LearnerDetailPanel> {
  LearnerDetail? _d;
  bool _loading = true;
  String? _error;
  bool _busy = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = _d == null;
      _error = null;
    });
    try {
      final res = await ref.read(apiClientProvider).get('/admin/learners/${widget.userId}');
      if (!mounted) return;
      setState(() {
        _d = LearnerDetail.fromJson(J.map(res.data));
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

  Future<void> _act(Future<void> Function() fn, String done) async {
    setState(() => _busy = true);
    try {
      await fn();
      if (!mounted) return;
      adminToast(context, done);
      await _load();
      widget.onChanged();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _launch(Uri uri) async {
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) && mounted) {
      adminToast(context, context.isFrench ? "Impossible d'ouvrir ce lien." : 'Could not open this link.', error: true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) {
      return AdminPanel(
        title: fr ? 'Chargement…' : 'Loading…',
        children: const [AdminLoading()],
      );
    }
    if (_error != null || _d == null) {
      return AdminPanel(
        title: fr ? 'Compte' : 'Account',
        children: [AdminError(message: _error ?? (fr ? 'Introuvable' : 'Not found'), onRetry: _load)],
      );
    }

    final d = _d!;
    final isPortal = d.role != 'learner';
    final openReq = d.requests.where((r) => r.status == 'open').firstOrNull;
    final hasDirectActiveLicense = d.licenses.any((l) => l.active && !l.viaCompany);
    final waDigits = OnlineFmt.whatsappDigits(d.whatsapp);

    return AdminPanel(
      title: d.fullName,
      subtitle: d.email,
      leading: InitialsAvatar(d.fullName, size: 44, color: OnlineFmt.roleColor(d.role)),
      children: [
        Wrap(
          spacing: 6,
          runSpacing: 6,
          children: [
            Pill(OnlineFmt.roleLabel(d.role, fr), color: OnlineFmt.roleColor(d.role)),
            Pill(d.emailVerified ? (fr ? 'Vérifié' : 'Verified') : (fr ? 'Non vérifié' : 'Unverified'), color: d.emailVerified ? AppColors.good : AppColors.textMuted),
            if (d.googleLinked) const Pill('Google', color: Color(0xFF2563EB)),
            if (!d.isActive) Pill(fr ? 'Suspendu' : 'Suspended', color: AppColors.bad, solid: true),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            AdminButton(
              fr ? 'Copier e-mail' : 'Copy email',
              icon: Icons.copy_outlined,
              primary: false,
              onPressed: () {
                Clipboard.setData(ClipboardData(text: d.email));
                adminToast(context, fr ? 'E-mail copié' : 'Email copied');
              },
            ),
            AdminButton(
              'E-mail',
              icon: Icons.mail_outline,
              primary: false,
              onPressed: () => _launch(Uri(scheme: 'mailto', path: d.email)),
            ),
            if (waDigits.length >= 7)
              OutlinedButton.icon(
                onPressed: () => _launch(Uri.parse('https://wa.me/$waDigits')),
                icon: const Icon(Icons.chat_outlined, size: 17),
                label: Text(d.whatsapp),
                style: OutlinedButton.styleFrom(
                  foregroundColor: const Color(0xFF15803D),
                  backgroundColor: const Color(0xFFF0FDF4),
                  side: const BorderSide(color: Color(0xFFBBF7D0)),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  minimumSize: const Size(0, 44),
                  textStyle: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
                ),
              ),
          ],
        ),
        const SizedBox(height: 14),
        AdminGrid(
          minTileWidth: 145,
          maxColumns: 2,
          spacing: 10,
          children: [
            _MetaMiniBox(
              label: fr ? 'Niveau de français' : 'French level',
              value: d.frenchLevel.isNotEmpty ? OnlineFmt.levelLabel(d.frenchLevel, fr) : (fr ? 'Non défini' : 'Not set'),
            ),
            _MetaMiniBox(
              label: fr ? 'Inscription' : 'Joined',
              value: AdminFmt.day(context, d.createdAt),
            ),
            _MetaMiniBox(
              label: fr ? 'Appareils connectés' : 'Signed-in devices',
              value: fr ? '${d.devices} actif${d.devices > 1 ? 's' : ''}' : '${d.devices} active device${d.devices == 1 ? '' : 's'}',
            ),
            _MetaMiniBox(
              label: fr ? 'Activité 30 jours' : '30-day activity',
              value: fr ? '${d.lessonsOpened30d} chargements' : '${d.lessonsOpened30d} protected loads',
            ),
          ],
        ),
        if (d.orgName.isNotEmpty || d.country.isNotEmpty || d.lang.isNotEmpty) ...[
          PanelSection(fr ? 'Profil' : 'Profile context'),
          AdminCard(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            child: Column(
              children: [
                if (d.orgName.isNotEmpty) InfoRow(icon: Icons.apartment_outlined, label: fr ? 'Entreprise' : 'Company', value: d.orgName),
                if (d.country.isNotEmpty) InfoRow(icon: Icons.public, label: fr ? 'Pays' : 'Country', value: d.country),
                if (d.lang.isNotEmpty) InfoRow(icon: Icons.translate, label: fr ? 'Langue' : 'Interface', value: d.lang.toUpperCase()),
                InfoRow(
                  icon: Icons.campaign_outlined,
                  label: fr ? 'E-mails marketing' : 'Marketing emails',
                  value: d.marketingOptIn ? (fr ? 'Inscrit' : 'Opted in') : (fr ? 'Non' : 'No'),
                ),
              ],
            ),
          ),
        ],
        PanelSection(fr ? 'Accès actuel au site' : 'Current website access'),
        AdminCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (d.accessLevel == 'premium') ...[
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Pill(
                      d.accessPlan == 'standard' ? (fr ? 'Forfait Standard' : 'Standard Plan') : (fr ? 'Forfait Premium' : 'Premium Plan'),
                      color: d.accessPlan == 'standard' ? const Color(0xFF1D4ED8) : AppColors.frenchGold,
                      icon: d.accessPlan == 'standard' ? Icons.layers_outlined : Icons.workspace_premium,
                      solid: true,
                    ),
                    Text(
                      (d.accessUntil != null
                              ? (fr ? 'Actif jusqu’au ${AdminFmt.day(context, d.accessUntil)}' : 'Active until ${AdminFmt.day(context, d.accessUntil)}')
                              : (fr ? 'Sans date de fin' : 'No end date')) +
                          (d.accessVia == 'company' ? (fr ? ' (via entreprise)' : ' (via company)') : ''),
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ] else if (d.accessWebsite) ...[
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Pill(fr ? 'Compte gratuit' : 'Free account', color: AppColors.good),
                    Text(
                      fr ? 'Accès Module 1 (A1–C2)' : 'Starter Module 1 access across A1–C2 paths',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ] else ...[
                Wrap(
                  spacing: 8,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    Pill(fr ? 'Site désactivé' : 'Website off', color: AppColors.textMuted),
                    Text(
                      fr ? 'Portail étudiant / entreprise uniquement' : 'Student / company portal only',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ],
              if (openReq != null) ...[
                const SizedBox(height: 12),
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppColors.warnBg,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.warnBorder),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        fr ? 'Demande envoyée le ${AdminFmt.day(context, openReq.createdAt)}' : 'Requested access on ${AdminFmt.day(context, openReq.createdAt)}',
                        style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: const Color(0xFF92400E)),
                      ),
                      if (openReq.message.isNotEmpty) ...[
                        const SizedBox(height: 4),
                        Text('“${openReq.message}”', style: AppTypography.bodySmall.copyWith(color: const Color(0xFF78350F))),
                      ],
                      const SizedBox(height: 8),
                      AdminButton(
                        fr ? 'Classer la demande' : 'Dismiss request',
                        primary: false,
                        busy: _busy,
                        onPressed: () => _act(
                          () => ref.read(apiClientProvider).post('/admin/learners/requests/${openReq.id}/dismiss', data: {}),
                          fr ? 'Demande classée' : 'Request dismissed',
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
        PanelSection(fr ? 'Activer ou changer le forfait' : 'Activate or change plan license'),
        AdminCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              GrantPlanForm(
                initialTier: d.accessPlan == 'standard' ? 'standard' : 'premium',
                busy: _busy,
                onSubmit: (tier, endsAtIso, reason) => _act(
                  () => ref.read(apiClientProvider).post('/admin/learners/${d.id}/premium', data: {
                    'tier': tier,
                    'ends_at': endsAtIso,
                    'reason': reason,
                  }),
                  tier == 'standard' ? (fr ? 'Standard activé' : 'Standard activated') : (fr ? 'Premium activé' : 'Premium activated'),
                ),
              ),
              if (hasDirectActiveLicense) ...[
                const SizedBox(height: 10),
                AdminButton(
                  fr ? 'Mettre fin au forfait actif' : 'End active plan now',
                  icon: Icons.block,
                  primary: false,
                  danger: true,
                  busy: _busy,
                  onPressed: () async {
                    final ok = await confirmAdmin(
                      context,
                      title: fr ? 'Terminer ce forfait maintenant ?' : 'End this person’s active plan now?',
                      message: fr ? 'L’accès payant prend fin immédiatement.' : 'Paid website access will end immediately.',
                      confirmLabel: fr ? 'Mettre fin' : 'End Plan',
                    );
                    if (!ok || !mounted) return;
                    await _act(
                      () => ref.read(apiClientProvider).post('/admin/learners/${d.id}/premium/revoke', data: {
                        'reason': 'Ended by an administrator',
                      }),
                      fr ? 'Forfait terminé' : 'Plan ended',
                    );
                  },
                ),
              ],
            ],
          ),
        ),
        if (isPortal) ...[
          PanelSection(fr ? 'Accès site du portail' : 'Portal website access'),
          AdminCard(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  fr
                      ? 'Détermine si ce compte étudiant/entreprise peut se connecter sur le site.${d.orgName.isNotEmpty ? ' Défaut entreprise : ${d.orgLearnAccess}.' : ''}'
                      : 'Controls whether this student or company account can also sign in on the website.${d.orgName.isNotEmpty ? ' Company default: “${d.orgLearnAccess}”.' : ''}',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
                const SizedBox(height: 12),
                AdminSelect<String>(
                  label: fr ? 'Accès site web' : 'Website access',
                  value: d.learnAccess,
                  options: [
                    FilterOption('off', fr ? 'Désactivé (portail uniquement)' : 'Off (portal only)'),
                    FilterOption('free', fr ? 'Compte gratuit (Module 1)' : 'Free website account (Module 1 starter paths)'),
                  ],
                  onChanged: (v) {
                    if (v == null || v == d.learnAccess || _busy) return;
                    _act(
                      () => ref.read(apiClientProvider).put('/admin/learners/${d.id}/website', data: {'learn_access': v}),
                      fr ? 'Accès site enregistré' : 'Website access saved',
                    );
                  },
                ),
              ],
            ),
          ),
        ],
        if (d.role == 'learner') ...[
          PanelSection(fr ? 'Statut du compte' : 'Account status'),
          AdminCard(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        d.isActive ? (fr ? 'Compte actif' : 'Account active') : (fr ? 'Compte suspendu' : 'Account suspended'),
                        style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        d.isActive ? (fr ? 'Connexion autorisée.' : 'Allowed to sign in.') : (fr ? 'Accès bloqué.' : 'Currently blocked from signing in.'),
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 10),
                AdminButton(
                  d.isActive ? (fr ? 'Suspendre' : 'Suspend') : (fr ? 'Réactiver' : 'Restore'),
                  primary: !d.isActive,
                  danger: d.isActive,
                  busy: _busy,
                  onPressed: () async {
                    final ok = await confirmAdmin(
                      context,
                      title: d.isActive ? (fr ? 'Suspendre ce compte ?' : 'Suspend this account?') : (fr ? 'Réactiver ce compte ?' : 'Restore this account?'),
                      message: d.isActive ? (fr ? 'Les sessions web ouvertes seront fermées.' : 'They are signed out at once.') : (fr ? 'Le compte pourra se reconnecter.' : 'They will be allowed to sign in again.'),
                      confirmLabel: d.isActive ? (fr ? 'Suspendre' : 'Suspend') : (fr ? 'Réactiver' : 'Restore'),
                      danger: d.isActive,
                    );
                    if (!ok || !mounted) return;
                    await _act(
                      () => ref.read(apiClientProvider).put('/admin/learners/${d.id}/active', data: {'is_active': !d.isActive}),
                      d.isActive ? (fr ? 'Compte suspendu' : 'Account suspended') : (fr ? 'Compte réactivé' : 'Account restored'),
                    );
                  },
                ),
              ],
            ),
          ),
        ],
        PanelSection(fr ? 'Historique d’activité' : 'Activity history'),
        AdminCard(
          padding: const EdgeInsets.all(14),
          child: d.history.isEmpty
              ? Text(fr ? 'Aucun événement enregistré.' : 'No events recorded yet.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))
              : Column(
                  children: [
                    for (var i = 0; i < d.history.length; i++) ...[
                      if (i > 0) const Divider(height: 16, color: AppColors.borderSoft),
                      _HistoryRow(item: d.history[i]),
                    ],
                  ],
                ),
        ),
      ],
    );
  }
}

class _MetaMiniBox extends StatelessWidget {
  final String label;
  final String value;
  const _MetaMiniBox({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
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
          Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600)),
          const SizedBox(height: 3),
          Text(value, style: AppTypography.bodyMedium.copyWith(color: AppColors.ink, fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
        ],
      ),
    );
  }
}

class _HistoryRow extends StatelessWidget {
  final LearnerHistoryItem item;
  const _HistoryRow({required this.item});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final reason = J.s(item.detail['reason']);
    final hasEnds = item.detail.containsKey('ends_at') && item.action == 'premium_granted';
    final endsAt = J.date(item.detail['ends_at']);
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          margin: const EdgeInsets.only(top: 5),
          width: 8,
          height: 8,
          decoration: const BoxDecoration(color: AppColors.adminAccent, shape: BoxShape.circle),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(OnlineFmt.actionLabel(item.action, fr), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
              Text(
                '${AdminFmt.dateTime(context, item.createdAt)}${item.actorName.isNotEmpty ? ' · ${item.actorName}' : ''}',
                style: AppTypography.caption.copyWith(color: AppColors.textMuted),
              ),
              if (reason.isNotEmpty)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(reason, style: AppTypography.caption.copyWith(color: AppColors.text)),
                ),
              if (hasEnds)
                Padding(
                  padding: const EdgeInsets.only(top: 2),
                  child: Text(
                    endsAt == null ? (fr ? 'Sans date de fin' : 'No end date') : (fr ? 'Jusqu’au ${AdminFmt.day(context, endsAt)}' : 'Until ${AdminFmt.day(context, endsAt)}'),
                    style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
