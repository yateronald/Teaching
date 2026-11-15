import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../common/admin_state.dart';
import 'campaign_editor_panel.dart';
import 'campaign_share_panel.dart';
import 'marketing_model.dart';
import 'marketing_widgets.dart';
import 'registration_panel.dart';

/// One campaign: where it stands, how it looks on the site, its figures and
/// the people who registered. Pops the id of a copy to open next, 0 once
/// deleted, or nothing.
class CampaignDetailPanel extends ConsumerStatefulWidget {
  final int campaignId;
  const CampaignDetailPanel({super.key, required this.campaignId});

  @override
  ConsumerState<CampaignDetailPanel> createState() => _CampaignDetailPanelState();
}

class _CampaignDetailPanelState extends ConsumerState<CampaignDetailPanel> {
  Campaign? _c;
  Map<String, dynamic> _stats = {};
  List<Map<String, dynamic>> _regs = [];
  bool _loading = true;
  bool _busy = false;
  bool _notInstalled = false;
  String? _error;
  String _regFilter = 'all';
  bool? _previewFr;
  bool _allRegs = false;

  String get _base => '/admin/promotions/${widget.campaignId}';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _error = null);
    try {
      final api = ref.read(apiClientProvider);
      final results = await Future.wait([api.get(_base), api.get('$_base/registrations')]);
      if (!mounted) return;
      final data = J.map(results[0].data);
      setState(() {
        _c = Campaign.fromJson(J.map(data['promotion']));
        _stats = J.map(data['stats']);
        _regs = J.list(results[1].data, ['registrations']);
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _notInstalled = marketingNotInstalled(e);
        _error = apiErrorText(context, e);
        _loading = false;
      });
    }
  }

  /// Runs a change, then reloads everything; errors are shown, never swallowed.
  Future<void> _run(Future<void> Function() action, {String? done}) async {
    setState(() => _busy = true);
    try {
      await action();
      if (!mounted) return;
      if (done != null) adminToast(context, done);
      await _load();
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _setStatus(String status, String done) => _run(() => ref.read(apiClientProvider).post('$_base/status', data: {'status': status}), done: done);

  Future<void> _publish() {
    final fr = context.isFrench;
    final later = _c!.startsAt.isAfter(DateTime.now());
    return _setStatus(
      'published',
      later
          ? (fr
                ? 'Publiée : elle apparaîtra le ${AdminFmt.dateTime(context, _c!.startsAt)}'
                : 'Published: it will appear on ${AdminFmt.dateTime(context, _c!.startsAt)}')
          : (fr ? 'Publiée : elle est sur le site' : 'Published: it is on the site now'),
    );
  }

  Future<void> _edit() async {
    final saved = await showAdminPanel<bool>(context, tabletWidth: 640, builder: (_) => CampaignEditorPanel(campaign: _c));
    if (saved == true && mounted) await _load();
  }

  Future<void> _share() => showAdminPanel(context, tabletWidth: 560, builder: (_) => CampaignSharePanel(campaign: _c!));

  Future<void> _duplicate() async {
    final fr = context.isFrench;
    setState(() => _busy = true);
    try {
      final res = await ref.read(apiClientProvider).post('$_base/duplicate');
      if (!mounted) return;
      final id = J.i(J.map(J.map(res.data)['promotion'])['id']);
      adminToast(context, fr ? 'Copie créée en brouillon' : 'Copy created as a draft');
      Navigator.of(context).pop(id);
    } catch (e) {
      if (mounted) {
        adminToast(context, apiErrorText(context, e), error: true);
        setState(() => _busy = false);
      }
    }
  }

  Future<void> _delete() async {
    final fr = context.isFrench;
    final ok = await confirmAdmin(
      context,
      title: fr ? 'Supprimer cette campagne ?' : 'Delete this campaign?',
      message: fr
          ? 'Personne ne s’y est inscrit. Elle sera supprimée définitivement, avec ses statistiques.'
          : 'Nobody registered for it. It will be deleted for good, with its figures.',
      confirmLabel: fr ? 'Supprimer' : 'Delete',
    );
    if (!ok || !mounted) return;
    setState(() => _busy = true);
    try {
      await ref.read(apiClientProvider).delete(_base);
      if (!mounted) return;
      adminToast(context, fr ? 'Campagne supprimée' : 'Campaign deleted');
      Navigator.of(context).pop(0);
    } catch (e) {
      if (mounted) {
        adminToast(context, apiErrorText(context, e), error: true);
        setState(() => _busy = false);
      }
    }
  }

  Future<void> _openRegistration(Map<String, dynamic> r) async {
    await showAdminPanel(
      context,
      tabletWidth: 560,
      builder: (_) => RegistrationPanel(campaign: _c!, registration: r),
    );
    if (!mounted) return;
    await _load();
    refreshMarketingBadge(ref);
  }

  // ── Build ───────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final c = _c;
    if (c == null) {
      return AdminPanel(
        title: fr ? 'Campagne' : 'Campaign',
        children: [
          if (_loading)
            const AdminLoading()
          else if (_notInstalled)
            MarketingNotInstalled(onRetry: _load)
          else
            AdminError(message: _error ?? '', onRetry: _load),
        ],
      );
    }
    final t = themeOf(c.theme);
    final previewFr = _previewFr ?? fr;

    return AdminPanel(
      title: c.title(fr),
      subtitle: '${kindLabel(c.kind, fr)} · ${audienceLabel(c.audience, fr)}${c.level != null ? ' · ${c.level}' : ''}',
      leading: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(gradient: t.gradient, borderRadius: BorderRadius.circular(12)),
        child: Icon(kindIcon(c.kind), color: t.accent, size: 22),
      ),
      children: [
        Row(
          children: [
            Pill(stateLabel(c.state, fr), color: stateColor(c.state), icon: Icons.circle),
            const SizedBox(width: 8),
            if (_busy) const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.adminAccent)),
          ],
        ),
        const SizedBox(height: 10),
        ..._banners(context, c),
        _actions(context, c),
        const SizedBox(height: 14),
        _kpis(context, c),
        PanelSection(fr ? 'Inscriptions (${_regs.length})' : 'Registrations (${_regs.length})'),
        _registrations(context, c),
        PanelSection(
          fr ? 'Aperçu sur le site' : 'Preview on the site',
          trailing: SegmentedButton<bool>(
            segments: const [
              ButtonSegment(value: true, label: Text('FR')),
              ButtonSegment(value: false, label: Text('EN')),
            ],
            selected: {previewFr},
            showSelectedIcon: false,
            style: const ButtonStyle(visualDensity: VisualDensity.compact, tapTargetSize: MaterialTapTargetSize.shrinkWrap),
            onSelectionChanged: (s) => setState(() => _previewFr = s.first),
          ),
        ),
        CampaignPreview(campaign: c, fr: previewFr),
        PanelSection(fr ? 'Résultats par emplacement' : 'Results by place'),
        _places(context),
        PanelSection(fr ? '30 derniers jours' : 'Last 30 days'),
        _days(context, t),
        PanelSection(fr ? 'Réglages' : 'Settings'),
        _settings(context, c),
      ],
    );
  }

  List<Widget> _banners(BuildContext context, Campaign c) {
    final fr = context.isFrench;
    final later = c.startsAt.isAfter(DateTime.now());
    return [
      if (c.state == 'draft')
        MarketingBanner(
          icon: Icons.edit_note,
          color: AppColors.textMuted,
          title: fr ? 'Brouillon' : 'Draft',
          text: fr
              ? 'Vous seul la voyez. Publiez-la pour la mettre sur le site${later ? ' à partir du ${AdminFmt.dateTime(context, c.startsAt)}' : ''}.'
              : 'Only you see it. Publish it to put it on the site${later ? ' from ${AdminFmt.dateTime(context, c.startsAt)}' : ''}.',
        ),
      if (c.state == 'scheduled')
        MarketingBanner(
          icon: Icons.schedule,
          color: const Color(0xFF2563EB),
          title: fr ? 'Programmée' : 'Scheduled',
          text: fr
              ? 'Elle apparaîtra d’elle-même sur le site le ${AdminFmt.dateTime(context, c.startsAt)}.'
              : 'It will appear on the site by itself on ${AdminFmt.dateTime(context, c.startsAt)}.',
        ),
      if (c.state == 'paused')
        MarketingBanner(
          icon: Icons.pause_circle_outline,
          color: AppColors.warn,
          title: fr ? 'En pause' : 'Paused',
          text: fr
              ? 'Elle n’est plus sur le site et n’accepte plus d’inscriptions. Les personnes inscrites restent ici.'
              : 'It is off the site and closed to registrations. The people who registered stay here.',
        ),
      if (c.state == 'ended')
        MarketingBanner(
          icon: Icons.event_busy,
          color: AppColors.textMuted,
          title: fr ? 'Terminée le ${AdminFmt.dateTime(context, c.endsAt)}' : 'Ended on ${AdminFmt.dateTime(context, c.endsAt)}',
          text: fr
              ? 'Elle a quitté le site d’elle-même. Modifiez la date de fin pour la remontrer, ou dupliquez-la pour le prochain groupe.'
              : 'It left the site by itself. Edit the end date to show it again, or duplicate it for the next group.',
        ),
      if (c.full && c.state != 'archived')
        MarketingBanner(
          icon: Icons.event_seat,
          color: AppColors.warn,
          title: fr ? 'Groupe complet' : 'Group full',
          text: fr
              ? 'Les nouvelles personnes s’inscrivent sur la liste d’attente. Augmentez le nombre de places ou annulez une inscription pour libérer une place.'
              : 'New people join the waiting list. Raise the number of seats or cancel a registration to free a seat.',
        ),
    ];
  }

  Widget _actions(BuildContext context, Campaign c) {
    final fr = context.isFrench;
    // Every action waits while another one runs.
    VoidCallback? idle(VoidCallback action) => _busy ? null : action;
    final primary = switch (c.status) {
      'draft' => AdminButton(fr ? 'Publier' : 'Publish', key: const Key('campaign-publish'), icon: Icons.rocket_launch_outlined, onPressed: idle(_publish)),
      'published' => AdminButton(
        fr ? 'Mettre en pause' : 'Pause',
        key: const Key('campaign-pause'),
        icon: Icons.pause_circle_outline,
        primary: false,
        onPressed: idle(() => _setStatus('paused', fr ? 'En pause : elle n’est plus sur le site' : 'Paused: it is off the site')),
      ),
      _ => AdminButton(
        c.status == 'archived' ? (fr ? 'Republier' : 'Publish again') : (fr ? 'Reprendre' : 'Resume'),
        key: const Key('campaign-resume'),
        icon: Icons.play_circle_outline,
        onPressed: idle(() => _setStatus('published', fr ? 'De nouveau sur le site' : 'Back on the site')),
      ),
    };
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        primary,
        AdminButton(fr ? 'Modifier' : 'Edit', key: const Key('campaign-edit'), icon: Icons.edit_outlined, primary: false, onPressed: idle(_edit)),
        AdminButton(fr ? 'Partager' : 'Share', key: const Key('campaign-share'), icon: Icons.share_outlined, primary: false, onPressed: idle(_share)),
        PopupMenuButton<String>(
          key: const Key('campaign-more'),
          tooltip: fr ? 'Plus d’actions' : 'More actions',
          enabled: !_busy,
          icon: const Icon(Icons.more_horiz, color: AppColors.textMuted),
          onSelected: (v) {
            switch (v) {
              case 'copy':
                _duplicate();
              case 'archive':
                _setStatus('archived', fr ? 'Campagne archivée' : 'Campaign archived');
              case 'draft':
                _setStatus('draft', fr ? 'Revenue en brouillon : elle n’est plus sur le site' : 'Back to draft: it is off the site');
              case 'delete':
                _delete();
            }
          },
          itemBuilder: (_) => [
            PopupMenuItem(value: 'copy', child: _menu(Icons.copy_all_outlined, fr ? 'Dupliquer en brouillon' : 'Duplicate as a draft')),
            if (c.status != 'archived') PopupMenuItem(value: 'archive', child: _menu(Icons.inventory_2_outlined, fr ? 'Archiver' : 'Archive')),
            if (c.status != 'draft') PopupMenuItem(value: 'draft', child: _menu(Icons.edit_note, fr ? 'Repasser en brouillon' : 'Back to draft')),
            if (c.registrations == 0)
              PopupMenuItem(
                value: 'delete',
                child: _menu(Icons.delete_outline, fr ? 'Supprimer' : 'Delete', color: AppColors.bad),
              )
            else
              PopupMenuItem(
                enabled: false,
                child: _menu(Icons.delete_outline, fr ? 'Supprimer (des personnes sont inscrites : archivez-la)' : 'Delete (people registered: archive it)'),
              ),
          ],
        ),
      ],
    );
  }

  Widget _menu(IconData icon, String label, {Color? color}) => Row(
    children: [
      Icon(icon, size: 18, color: color ?? AppColors.textMuted),
      const SizedBox(width: 10),
      Flexible(
        child: Text(label, style: TextStyle(color: color)),
      ),
    ],
  );

  Widget _kpis(BuildContext context, Campaign c) {
    final fr = context.isFrench;
    final limit = c.seatLimit;
    return AdminGrid(
      minTileWidth: 140,
      maxColumns: 4,
      spacing: 10,
      children: [
        StatTile(
          label: limit == null ? (fr ? 'Inscriptions' : 'Registrations') : (fr ? 'Places prises' : 'Seats taken'),
          value: limit == null ? '${c.registrations}' : '${c.seatsTaken} / $limit',
          sub: limit == null
              ? (fr ? 'Sans limite de places' : 'No seat limit')
              : (c.full
                    ? (fr ? 'Complet · ${c.waitlist} en attente' : 'Full · ${c.waitlist} waiting')
                    : (fr ? '${c.seatsLeft ?? limit} place(s) libre(s)' : '${c.seatsLeft ?? limit} seat(s) left')),
          icon: Icons.event_seat_outlined,
          color: c.full ? AppColors.warn : AppColors.adminAccent,
        ),
        StatTile(
          label: fr ? 'À contacter' : 'To contact',
          value: '${c.newRegistrations}',
          sub: c.lastRegistrationAt == null
              ? (fr ? 'Aucune inscription' : 'No registration yet')
              : (fr ? 'Dernière ${AdminFmt.relative(context, c.lastRegistrationAt)}' : 'Last ${AdminFmt.relative(context, c.lastRegistrationAt)}'),
          icon: Icons.mark_email_unread_outlined,
          color: c.newRegistrations > 0 ? AppColors.warn : AppColors.textMuted,
          onTap: c.newRegistrations == 0 ? null : () => setState(() => _regFilter = 'new'),
        ),
        StatTile(
          label: fr ? 'Vues' : 'Views',
          value: AdminFmt.number(context, c.views),
          sub: fr ? '${AdminFmt.number(context, c.clicks)} clic(s)' : '${AdminFmt.number(context, c.clicks)} click(s)',
          icon: Icons.visibility_outlined,
          color: const Color(0xFF7C3AED),
        ),
        StatTile(
          label: fr ? 'Conversion' : 'Conversion',
          value: campaignRate(c.registrations, c.views),
          sub: fr ? 'des vues finissent inscrites' : 'of views end in a registration',
          icon: Icons.trending_up,
          color: AppColors.good,
        ),
      ],
    );
  }

  Widget _registrations(BuildContext context, Campaign c) {
    final fr = context.isFrench;
    if (_regs.isEmpty) {
      return MarketingBox(
        child: Text(
          c.registrationMode == 'link'
              ? (fr ? 'Le bouton mène à un autre lien : les inscriptions se font là-bas.' : 'The button leads to another link: people register there.')
              : c.registrationMode == 'none'
              ? (fr ? 'Cette campagne n’a pas de formulaire d’inscription.' : 'This campaign has no registration form.')
              : (fr
                    ? 'Personne ne s’est encore inscrit. Partagez le lien pour attirer du monde.'
                    : 'Nobody has registered yet. Share the link to bring people in.'),
          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
        ),
      );
    }
    int count(String s) => _regs.where((r) => J.s(r['status']) == s).length;
    final options = [
      FilterOption('all', fr ? 'Toutes' : 'All', count: _regs.length),
      for (final s in registrationStatuses)
        if (count(s) > 0) FilterOption(s, registrationLabel(s, fr), count: count(s)),
    ];
    final shown = _regs.where((r) => _regFilter == 'all' || J.s(r['status']) == _regFilter).toList();
    final visible = _allRegs ? shown : shown.take(12).toList();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AdminFilterChips<String>(
          options: options,
          selected: options.any((o) => o.value == _regFilter) ? _regFilter : 'all',
          onSelected: (v) => setState(() => _regFilter = v),
        ),
        const SizedBox(height: 8),
        MarketingBox(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Column(
            children: [
              for (var i = 0; i < visible.length; i++) ...[
                if (i > 0) const Divider(height: 1, color: AppColors.borderSoft),
                _RegistrationRow(registration: visible[i], onTap: () => _openRegistration(visible[i])),
              ],
            ],
          ),
        ),
        if (!_allRegs && shown.length > visible.length)
          Align(
            alignment: Alignment.centerLeft,
            child: Padding(
              padding: const EdgeInsets.only(top: 6),
              child: AdminLink(fr ? 'Voir les ${shown.length}' : 'See all ${shown.length}', onTap: () => setState(() => _allRegs = true)),
            ),
          ),
      ],
    );
  }

  Widget _places(BuildContext context) {
    final fr = context.isFrench;
    final places = J.list(_stats['places']);
    if (places.isEmpty) {
      return MarketingBox(
        child: Text(
          fr ? 'Pas encore de vue : les chiffres arrivent dès qu’elle est sur le site.' : 'No view yet: the figures come as soon as it is on the site.',
          style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
        ),
      );
    }
    final top = places.map((p) => J.i(p['views'])).fold<int>(1, (a, b) => b > a ? b : a);
    return MarketingBox(
      child: Column(
        children: [
          for (final p in places)
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 7),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(placeIcon(J.s(p['placement'])), size: 16, color: AppColors.textMuted),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          placeLabel(J.s(p['placement']), fr),
                          style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        fr ? '${J.i(p['registrations'])} inscription(s)' : '${J.i(p['registrations'])} registration(s)',
                        style: AppTypography.caption.copyWith(color: AppColors.ink, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                  const SizedBox(height: 2),
                  Text(
                    fr
                        ? '${AdminFmt.number(context, J.i(p['views']))} vues · ${AdminFmt.number(context, J.i(p['clicks']))} clics (${campaignRate(J.i(p['clicks']), J.i(p['views']))})'
                        : '${AdminFmt.number(context, J.i(p['views']))} views · ${AdminFmt.number(context, J.i(p['clicks']))} clicks (${campaignRate(J.i(p['clicks']), J.i(p['views']))})',
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  ),
                  const SizedBox(height: 5),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: J.i(p['views']) / top,
                      minHeight: 5,
                      backgroundColor: AppColors.surfaceSoft,
                      color: AppColors.adminAccent,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  /// One bar per day: the views, with a dot on the days people registered.
  Widget _days(BuildContext context, CampaignTheme t) {
    final fr = context.isFrench;
    final days = {for (final d in J.list(_stats['days'])) J.s(d['day']): J.i(d['views'])};
    final regs = {for (final d in J.list(_stats['registration_days'])) J.s(d['day']): J.i(d['registrations'])};
    final today = DateTime.now();
    final keys = [
      for (var i = 29; i >= 0; i--)
        () {
          final d = DateTime(today.year, today.month, today.day - i);
          return '${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}';
        }(),
    ];
    final top = keys.map((k) => days[k] ?? 0).fold<int>(1, (a, b) => b > a ? b : a);
    final totalViews = keys.fold<int>(0, (s, k) => s + (days[k] ?? 0));
    final totalRegs = keys.fold<int>(0, (s, k) => s + (regs[k] ?? 0));
    return MarketingBox(
      padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            fr
                ? '${AdminFmt.number(context, totalViews)} vues · $totalRegs inscription(s)'
                : '${AdminFmt.number(context, totalViews)} views · $totalRegs registration(s)',
            style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 10),
          SizedBox(
            height: 70,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                for (final k in keys)
                  Expanded(
                    child: Tooltip(
                      message: '$k · ${days[k] ?? 0} ${fr ? 'vues' : 'views'}${(regs[k] ?? 0) > 0 ? ' · ${regs[k]} ${fr ? 'inscr.' : 'reg.'}' : ''}',
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                          if ((regs[k] ?? 0) > 0)
                            Container(
                              width: 6,
                              height: 6,
                              margin: const EdgeInsets.only(bottom: 3),
                              decoration: const BoxDecoration(color: AppColors.good, shape: BoxShape.circle),
                            ),
                          Container(
                            height: 4 + 50 * ((days[k] ?? 0) / top),
                            margin: const EdgeInsets.symmetric(horizontal: 1),
                            decoration: BoxDecoration(
                              color: (days[k] ?? 0) == 0 ? AppColors.borderSoft : t.a.withValues(alpha: 0.85),
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Text(
                AdminFmt.dayShort(context, DateTime(today.year, today.month, today.day - 29)),
                style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 10),
              ),
              Expanded(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(color: AppColors.good, shape: BoxShape.circle),
                    ),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        fr ? 'jour avec inscription' : 'day with a registration',
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 10),
                      ),
                    ),
                  ],
                ),
              ),
              Text(fr ? 'aujourd’hui' : 'today', style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 10)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _settings(BuildContext context, Campaign c) {
    final fr = context.isFrench;
    final price = !c.hasPrice
        ? null
        : [
            if (c.pricePromo != null) campaignMoney(c.pricePromo!, c.currency, fr),
            if (c.priceRegular != null)
              c.pricePromo != null
                  ? (fr ? 'au lieu de ${campaignMoney(c.priceRegular!, c.currency, fr)}' : 'instead of ${campaignMoney(c.priceRegular!, c.currency, fr)}')
                  : campaignMoney(c.priceRegular!, c.currency, fr),
          ].join(' ');
    final classDates = c.classStartsOn == null
        ? null
        : c.classEndsOn == null
        ? AdminFmt.day(context, c.classStartsOn)
        : '${AdminFmt.day(context, c.classStartsOn)} → ${AdminFmt.day(context, c.classEndsOn)}';
    return MarketingBox(
      child: Column(
        children: [
          InfoRow(icon: Icons.play_arrow_outlined, label: fr ? 'Sur le site à partir du' : 'On the site from', value: AdminFmt.dateTime(context, c.startsAt)),
          InfoRow(
            icon: Icons.stop_outlined,
            label: fr ? 'Jusqu’au' : 'Until',
            value: c.endsAt == null ? (fr ? 'Sans date de fin' : 'No end date') : AdminFmt.dateTime(context, c.endsAt),
          ),
          InfoRow(
            icon: Icons.dashboard_customize_outlined,
            label: fr ? 'Emplacements' : 'Places',
            value: [...c.places.map((p) => placeLabel(p, fr)), fr ? 'Page des offres' : 'Offers page'].join(' · '),
          ),
          if (classDates != null) InfoRow(icon: Icons.event_outlined, label: fr ? 'Dates du cours' : 'Class dates', value: classDates),
          if (c.word('schedule', fr) != null) InfoRow(icon: Icons.schedule, label: fr ? 'Horaire' : 'Timetable', value: c.word('schedule', fr)!),
          if (c.teacher != null) InfoRow(icon: Icons.person_outline, label: fr ? 'Professeur' : 'Teacher', value: c.teacher!),
          if (price != null) InfoRow(icon: Icons.sell_outlined, label: fr ? 'Prix' : 'Price', value: price),
          InfoRow(
            icon: Icons.how_to_reg_outlined,
            label: fr ? 'Inscription' : 'Registration',
            value: switch (c.registrationMode) {
              'link' => c.ctaUrl ?? '—',
              'none' => fr ? 'Pas de formulaire' : 'No form',
              _ => fr ? 'Formulaire sur le site' : 'Form on the site',
            },
          ),
          InfoRow(icon: Icons.low_priority, label: fr ? 'Priorité' : 'Priority', value: '${c.priority}'),
          InfoRow(icon: Icons.tag, label: fr ? 'Adresse courte' : 'Short name', value: c.slug),
        ],
      ),
    );
  }
}

class _RegistrationRow extends StatelessWidget {
  final Map<String, dynamic> registration;
  final VoidCallback onTap;
  const _RegistrationRow({required this.registration, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final r = registration;
    final name = J.s(r['full_name']).isEmpty ? J.s(r['email']) : J.s(r['full_name']);
    final status = J.s(r['status']);
    final details = [J.s(r['email']), if (J.s(r['country']).isNotEmpty) J.s(r['country']), if (J.s(r['level']).isNotEmpty) J.s(r['level'])].join(' · ');
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
        child: Row(
          children: [
            InitialsAvatar(name, size: 36),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    name,
                    style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(
                    details,
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  Text(AdminFmt.relative(context, J.date(r['created_at'])), style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 11)),
                ],
              ),
            ),
            const SizedBox(width: 6),
            Pill(registrationLabel(status, fr), color: registrationColor(status), solid: status == 'new'),
          ],
        ),
      ),
    );
  }
}
