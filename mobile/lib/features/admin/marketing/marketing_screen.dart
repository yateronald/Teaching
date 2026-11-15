import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../common/admin_state.dart';
import 'campaign_detail_panel.dart';
import 'campaign_editor_panel.dart';
import 'marketing_model.dart';
import 'marketing_widgets.dart';

/// The marketing campaigns of the public site (group classes, offers, free
/// events, announcements): what is live, what is scheduled, and who registered.
class MarketingScreen extends ConsumerStatefulWidget {
  const MarketingScreen({super.key});

  @override
  ConsumerState<MarketingScreen> createState() => _MarketingScreenState();
}

class _MarketingScreenState extends ConsumerState<MarketingScreen> {
  List<Campaign> _campaigns = [];
  Map<String, dynamic> _summary = {};
  bool _loading = true;
  bool _notInstalled = false;
  String? _error;
  String _search = '';
  String _filter = 'all';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = _campaigns.isEmpty && !_notInstalled;
      _error = null;
    });
    try {
      final res = await ref.read(apiClientProvider).get('/admin/promotions');
      if (!mounted) return;
      final data = J.map(res.data);
      setState(() {
        _campaigns = J.list(data, ['promotions']).map(Campaign.fromJson).toList();
        _summary = J.map(data['summary']);
        _notInstalled = false;
        _loading = false;
      });
      ref.read(newPromoRegistrationsProvider.notifier).state = J.i(_summary['new_registrations']);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _notInstalled = marketingNotInstalled(e);
        _error = apiErrorText(context, e);
        _loading = false;
      });
    }
  }

  bool _matches(Campaign c, String filter) => switch (filter) {
    'all' => true,
    'waiting' => c.newRegistrations > 0,
    _ => c.state == filter,
  };

  List<Campaign> get _filtered {
    final q = _search.trim().toLowerCase();
    return _campaigns.where((c) {
      if (!_matches(c, _filter)) return false;
      if (q.isEmpty) return true;
      return '${c.title(true)} ${c.title(false)} ${c.slug} ${c.teacher ?? ''}'.toLowerCase().contains(q);
    }).toList();
  }

  Future<void> _create() async {
    final id = await showAdminPanel<int>(context, tabletWidth: 640, builder: (_) => const CampaignEditorPanel());
    if (id == null || !mounted) return;
    await _load();
    if (id > 0 && mounted) await _open(id);
  }

  Future<void> _open(int id) async {
    final next = await showAdminPanel<int>(context, tabletWidth: 680, builder: (_) => CampaignDetailPanel(campaignId: id));
    if (!mounted) return;
    await _load();
    // A duplicate opens the new copy.
    if (next != null && next > 0 && next != id && mounted) await _open(next);
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
          MarketingNotInstalled(onRetry: _load),
        ],
      );
    }
    if (_error != null && _campaigns.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final list = _filtered;
    int count(String f) => _campaigns.where((c) => _matches(c, f)).length;
    final filters = [
      FilterOption('all', fr ? 'Toutes' : 'All', count: _campaigns.length),
      FilterOption('live', fr ? 'En ligne' : 'Live', count: count('live')),
      FilterOption('scheduled', fr ? 'Programmées' : 'Scheduled', count: count('scheduled')),
      FilterOption('draft', fr ? 'Brouillons' : 'Drafts', count: count('draft')),
      if (count('waiting') > 0) FilterOption('waiting', fr ? 'À contacter' : 'To contact', count: count('waiting')),
      if (count('paused') > 0) FilterOption('paused', fr ? 'En pause' : 'Paused', count: count('paused')),
      FilterOption('ended', fr ? 'Terminées' : 'Ended', count: count('ended')),
      if (count('archived') > 0) FilterOption('archived', fr ? 'Archivées' : 'Archived', count: count('archived')),
    ];
    final s = _summary;
    final waiting = J.i(s['new_registrations']);
    final conversion = s['conversion'] == null ? '—' : '${J.n(s['conversion'])} %';

    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              Expanded(
                child: AdminSearchField(hint: fr ? 'Rechercher une campagne' : 'Search a campaign', onChanged: (v) => setState(() => _search = v)),
              ),
              const SizedBox(width: 10),
              AdminButton(fr ? 'Nouvelle' : 'New', key: const Key('marketing-new'), icon: Icons.add, onPressed: _create),
            ],
          ),
          const SizedBox(height: 10),
          AdminFilterChips<String>(options: filters, selected: _filter, onSelected: (v) => setState(() => _filter = v)),
        ],
      ),
      children: [
        _header(fr),
        AdminGrid(
          minTileWidth: 150,
          maxColumns: 4,
          spacing: 10,
          children: [
            StatTile(
              label: fr ? 'En ligne' : 'Live now',
              value: '${J.i(s['live'])}',
              sub: fr ? '${J.i(s['scheduled'])} programmée(s)' : '${J.i(s['scheduled'])} scheduled',
              icon: Icons.podcasts,
              color: AppColors.good,
              onTap: () => setState(() => _filter = 'live'),
            ),
            StatTile(
              label: fr ? 'Inscriptions' : 'Registrations',
              value: AdminFmt.number(context, J.i(s['registrations'])),
              sub: fr ? '+${J.i(s['registrations_week'])} en 7 jours' : '+${J.i(s['registrations_week'])} in 7 days',
              icon: Icons.how_to_reg_outlined,
            ),
            StatTile(
              label: fr ? 'À contacter' : 'To contact',
              value: '$waiting',
              sub: fr ? 'Inscriptions sans réponse' : 'Registrations not answered',
              icon: Icons.mark_email_unread_outlined,
              color: waiting > 0 ? AppColors.warn : AppColors.textMuted,
              onTap: waiting == 0 ? null : () => setState(() => _filter = 'waiting'),
            ),
            StatTile(
              label: fr ? 'Vues' : 'Views',
              value: AdminFmt.number(context, J.i(s['views'])),
              sub: fr ? '$conversion s’inscrivent' : '$conversion register',
              icon: Icons.visibility_outlined,
              color: const Color(0xFF7C3AED),
            ),
          ],
        ),
        const SizedBox(height: 16),
        if (list.isEmpty)
          AdminEmpty(
            icon: Icons.campaign_outlined,
            title: _campaigns.isEmpty ? (fr ? 'Aucune campagne' : 'No campaign yet') : (fr ? 'Aucun résultat' : 'No match'),
            message: _campaigns.isEmpty
                ? (fr
                      ? 'Créez un groupe, une offre ou un événement : il apparaît sur le site aux dates que vous choisissez, avec un formulaire d’inscription.'
                      : 'Create a group, an offer or an event: it appears on the site on the dates you choose, with a registration form.')
                : null,
          )
        else
          AdminGrid(
            minTileWidth: 300,
            maxColumns: 3,
            spacing: 12,
            children: [for (final c in list) _CampaignCard(campaign: c, onTap: () => _open(c.id))],
          ),
      ],
    );
  }

  Widget _header(bool fr) => AdminHeader(
    overline: fr ? 'Gestion' : 'Management',
    title: 'Marketing',
    subtitle: fr
        ? 'Les campagnes du site : groupes, offres, événements et annonces, programmés entre deux dates, avec les personnes inscrites à chacune.'
        : 'The campaigns of the site: groups, offers, events and announcements, scheduled between two dates, with the people registered for each.',
  );
}

class _CampaignCard extends StatelessWidget {
  final Campaign campaign;
  final VoidCallback onTap;
  const _CampaignCard({required this.campaign, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final c = campaign;
    final t = themeOf(c.theme);
    final limit = c.seatLimit;
    final ratio = limit == null || limit == 0 ? 0.0 : (c.seatsTaken / limit).clamp(0.0, 1.0);
    final dates = c.endsAt == null
        ? (fr ? 'Dès le ${AdminFmt.day(context, c.startsAt)}' : 'From ${AdminFmt.day(context, c.startsAt)}')
        : '${AdminFmt.dayShort(context, c.startsAt)} → ${AdminFmt.day(context, c.endsAt)}';
    return Material(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(14),
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: onTap,
        child: Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(
                height: 74,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    CampaignPicture(imageKey: c.imageKey, theme: t),
                    DecoratedBox(
                      decoration: BoxDecoration(gradient: LinearGradient(colors: [t.b.withValues(alpha: 0.85), t.a.withValues(alpha: 0.35)])),
                    ),
                    Padding(
                      padding: const EdgeInsets.fromLTRB(12, 10, 10, 10),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Flexible(
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                              decoration: BoxDecoration(color: t.accent, borderRadius: BorderRadius.circular(999)),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(kindIcon(c.kind), size: 13, color: t.b),
                                  const SizedBox(width: 4),
                                  Flexible(
                                    child: Text(
                                      kindLabel(c.kind, fr),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: AppTypography.caption.copyWith(color: t.b, fontWeight: FontWeight.w800, fontSize: 11),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          _StatePill(state: c.state),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 12, 14, 14),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      c.title(fr),
                      style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        const Icon(Icons.date_range_outlined, size: 14, color: AppColors.textMuted),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            dates,
                            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                    if (limit != null) ...[
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Text(
                            fr ? 'Places' : 'Seats',
                            style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
                          ),
                          const Spacer(),
                          Text(
                            '${c.seatsTaken} / $limit',
                            style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: c.full ? AppColors.warn : AppColors.ink),
                          ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(4),
                        child: LinearProgressIndicator(
                          value: ratio,
                          minHeight: 6,
                          backgroundColor: AppColors.surfaceSoft,
                          color: c.full ? AppColors.warn : t.a,
                        ),
                      ),
                    ],
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 6,
                      runSpacing: 6,
                      children: [
                        Pill(
                          fr ? '${c.registrations} inscrit(s)' : '${c.registrations} registered',
                          color: AppColors.adminAccent,
                          icon: Icons.how_to_reg_outlined,
                        ),
                        if (c.newRegistrations > 0)
                          Pill(
                            fr ? '${c.newRegistrations} à contacter' : '${c.newRegistrations} to contact',
                            color: AppColors.warn,
                            icon: Icons.mark_email_unread_outlined,
                            solid: true,
                          ),
                        if (c.waitlist > 0)
                          Pill(fr ? '${c.waitlist} en attente' : '${c.waitlist} waiting', color: AppColors.textMuted, icon: Icons.hourglass_empty),
                        Pill(
                          fr ? '${AdminFmt.number(context, c.views)} vues' : '${AdminFmt.number(context, c.views)} views',
                          color: AppColors.textMuted,
                          icon: Icons.visibility_outlined,
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _StatePill extends StatelessWidget {
  final String state;
  const _StatePill({required this.state});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final color = stateColor(state);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(999)),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.circle, size: 8, color: color),
          const SizedBox(width: 5),
          Text(
            stateLabel(state, fr),
            style: AppTypography.caption.copyWith(color: color, fontWeight: FontWeight.w800, fontSize: 11),
          ),
        ],
      ),
    );
  }
}
