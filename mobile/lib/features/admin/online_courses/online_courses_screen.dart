import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../common/admin_state.dart';
import 'learner_detail_panel.dart';
import 'online_billing_tab.dart';
import 'online_courses_model.dart';

/// Executive Admin workspace for Website Online Courses:
///  - Live Free vs Paid Plans (Free · Standard · Premium) mode switcher
///  - 4 clickable KPI overview tiles
///  - People directory with server filters, search & WhatsApp quick action
///  - Companies directory with website access & company-wide plans
///  - Plans & Payments studio (delegated to [OnlineBillingTab])
class OnlineCoursesScreen extends ConsumerStatefulWidget {
  const OnlineCoursesScreen({super.key});

  @override
  ConsumerState<OnlineCoursesScreen> createState() => _OnlineCoursesScreenState();
}

class _OnlineCoursesScreenState extends ConsumerState<OnlineCoursesScreen> {
  String _tab = 'people'; // 'people' | 'companies' | 'payments'
  LearnModeInfo? _modeInfo;
  bool _modeBusy = false;
  int _billingRefresh = 0;

  // People directory state
  List<LearnerRow> _people = [];
  OnlineStats? _stats;
  int _peopleTotal = 0;
  int _page = 1;
  bool _peopleLoading = true;
  String? _peopleError;
  String _filter = 'all'; // 'all' | 'learners' | 'portal' | 'premium' | 'requests'
  String _tier = '';
  String _level = '';
  String _source = '';
  String _sort = 'recent';
  final _searchCtrl = TextEditingController();
  String _query = '';
  Timer? _debounce;

  // Companies state
  List<OnlineCompanyRow>? _orgs;
  bool _orgsLoading = false;
  String? _orgsError;
  String _orgSearch = '';
  String _orgFilter = 'all';

  @override
  void initState() {
    super.initState();
    _loadMode();
    _loadPeople(reset: true);
  }

  @override
  void dispose() {
    _debounce?.cancel();
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _refreshAll() async {
    await _loadMode();
    if (_tab == 'people') {
      await _loadPeople(reset: true);
    } else if (_tab == 'companies') {
      await _loadOrgs();
    } else {
      setState(() => _billingRefresh += 1);
    }
  }

  Future<void> _loadMode() async {
    try {
      final res = await ref.read(apiClientProvider).get('/admin/learners/mode');
      if (!mounted) return;
      setState(() => _modeInfo = LearnModeInfo.fromJson(J.map(res.data)));
    } catch (_) {
      // Errors on individual widgets do not block the screen.
    }
  }

  Future<void> _loadPeople({bool reset = false}) async {
    final targetPage = reset ? 1 : _page;
    setState(() {
      _peopleLoading = true;
      _peopleError = null;
    });
    try {
      final res = await ref.read(apiClientProvider).get(
        '/admin/learners',
        queryParameters: {
          'filter': _filter,
          'sort': _sort,
          'page': targetPage,
          'limit': 25,
          if (_tier.isNotEmpty) 'tier': _tier,
          if (_level.isNotEmpty) 'level': _level,
          if (_source.isNotEmpty) 'source': _source,
          if (_query.isNotEmpty) 'q': _query,
        },
      );
      if (!mounted) return;
      final data = J.map(res.data);
      final incoming = J.list(data, ['rows']).map(LearnerRow.fromJson).toList();
      final stats = data['stats'] is Map ? OnlineStats.fromJson(J.map(data['stats'])) : _stats;
      if (stats != null) {
        ref.read(openOnlineRequestsProvider.notifier).state = stats.openRequests;
      }
      setState(() {
        _people = reset ? incoming : [..._people, ...incoming];
        _peopleTotal = J.i(data['total']);
        _page = targetPage;
        _stats = stats;
        _peopleLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _peopleError = apiErrorText(context, e);
        _peopleLoading = false;
      });
    }
  }

  Future<void> _loadOrgs() async {
    setState(() {
      _orgsLoading = _orgs == null;
      _orgsError = null;
    });
    try {
      final res = await ref.read(apiClientProvider).get('/admin/learners/organizations');
      if (!mounted) return;
      setState(() {
        _orgs = J.list(res.data, ['rows']).map(OnlineCompanyRow.fromJson).toList();
        _orgsLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _orgsError = apiErrorText(context, e);
        _orgsLoading = false;
      });
    }
  }

  Future<void> _switchMode(String nextMode) async {
    final cur = _modeInfo;
    if (cur == null || cur.mode == nextMode || _modeBusy) return;
    final fr = context.isFrench;
    final toPremium = nextMode == 'premium';
    final ok = await confirmAdmin(
      context,
      title: toPremium
          ? (fr ? 'Activer les forfaits payants (Gratuit · Standard · Premium) ?' : 'Turn on Paid Plans (Free · Standard · Premium)?')
          : (fr ? 'Rendre tous les cours gratuits pour tous ?' : 'Make every course free for everyone?'),
      message: toPremium
          ? (fr
              ? 'Gratuit : Module 1 · Standard : 464+ cours & ateliers · Premium : Cours + Simulateur d’examen (TCF/TEF), annales & crédits IA. Les tarifs configurés prennent effet immédiatement.'
              : 'Free: Module 1 starters · Standard: all 464+ courses & labs · Premium: Courses + Exam Simulator (TCF/TEF), past papers & AI credits. Configured prices go live right away.')
          : (fr
              ? 'Chaque leçon, exercice et certificat ouvre à tous gratuitement et la page des tarifs passe en mode Gratuit.'
              : 'Every lesson, exercise and certificate opens to everyone for free, and online checkout pauses.'),
      confirmLabel: toPremium ? (fr ? 'Activer les forfaits' : 'Enable Paid Plans') : (fr ? 'Tout rendre gratuit' : 'Make everything free'),
      danger: false,
    );
    if (!ok || !mounted) return;
    setState(() => _modeBusy = true);
    try {
      final res = await ref.read(apiClientProvider).put('/admin/learners/mode', data: {'mode': nextMode});
      if (!mounted) return;
      setState(() => _modeInfo = LearnModeInfo.fromJson(J.map(res.data)));
      adminToast(
        context,
        toPremium
            ? (fr ? 'Forfaits payants activés (Gratuit · Standard · Premium)' : 'Paid plans enabled (Free · Standard · Premium)')
            : (fr ? 'Tous les cours sont gratuits pour tous' : 'Every course is free for everyone'),
      );
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _modeBusy = false);
    }
  }

  Future<void> _openLearner(int id) async {
    await showAdminPanel(
      context,
      tabletWidth: 560,
      builder: (_) => LearnerDetailPanel(userId: id, onChanged: () => _loadPeople(reset: true)),
    );
  }

  Future<void> _openWhatsApp(String raw) async {
    final digits = OnlineFmt.whatsappDigits(raw);
    if (digits.length < 7) return;
    final uri = Uri.parse('https://wa.me/$digits');
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) && mounted) {
      adminToast(context, context.isFrench ? 'Impossible d’ouvrir WhatsApp.' : 'Could not open WhatsApp.', error: true);
    }
  }

  Future<void> _openAcademy(bool fr) async {
    final uri = Uri.parse('${ApiEndpoints.siteUrl}${fr ? '/fr/apprendre/' : '/learn/'}');
    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) && mounted) {
      adminToast(context, fr ? 'Impossible d’ouvrir l’académie.' : 'Could not open the Academy.', error: true);
    }
  }

  bool get _hasExtraFilters =>
      _filter != 'all' || _tier.isNotEmpty || _level.isNotEmpty || _source.isNotEmpty || _sort != 'recent' || _query.isNotEmpty;

  void _resetFilters() {
    _searchCtrl.clear();
    setState(() {
      _filter = 'all';
      _tier = '';
      _level = '';
      _source = '';
      _sort = 'recent';
      _query = '';
    });
    _loadPeople(reset: true);
  }

  Future<void> _grantCompanyPlan(OnlineCompanyRow org) async {
    final fr = context.isFrench;
    await showDialog<void>(
      context: context,
      builder: (ctx) {
        var busy = false;
        return StatefulBuilder(
          builder: (ctx, setDlgState) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: Text(
              fr ? 'Forfait pour ${org.name}' : 'Plan access for ${org.name}',
              style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800),
            ),
            content: SizedBox(
              width: 440,
              child: SingleChildScrollView(
                child: GrantPlanForm(
                  initialTier: org.premiumTier == 'standard' ? 'standard' : 'premium',
                  busy: busy,
                  submitLabel: fr ? 'Activer pour l’entreprise' : 'Activate Company Plan',
                  onSubmit: (tier, endsAtIso, reason) async {
                    setDlgState(() => busy = true);
                    try {
                      await ref.read(apiClientProvider).post(
                        '/admin/learners/organizations/${org.id}/premium',
                        data: {'tier': tier, 'ends_at': endsAtIso, 'reason': reason},
                      );
                      if (!ctx.mounted) return;
                      Navigator.of(ctx).pop();
                      if (!mounted) return;
                      adminToast(context, fr ? 'Forfait activé pour l’entreprise' : 'Plan activated for the company');
                      await _loadOrgs();
                    } catch (e) {
                      setDlgState(() => busy = false);
                      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
                    }
                  },
                ),
              ),
            ),
            actions: [
              TextButton(
                onPressed: busy ? null : () => Navigator.of(ctx).pop(),
                child: Text(fr ? 'Fermer' : 'Close'),
              ),
            ],
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final s = _stats;

    return AdminPage(
      onRefresh: _refreshAll,
      children: [
        AdminHeader(
          overline: fr ? 'Console admin · Académie en ligne' : 'Admin console · Online Academy',
          title: fr ? 'Cours en ligne' : 'Online courses',
          subtitle: fr
              ? 'Gérez le mode d’accès du site, les apprenants, les entreprises, les forfaits et Paystack.'
              : 'Manage course access mode, learner accounts, company licenses, subscription plans, and Paystack.',
          actions: [
            AdminButton(
              fr ? 'Acad. en ligne' : 'Open Academy',
              icon: Icons.open_in_new,
              primary: false,
              onPressed: () => _openAcademy(fr),
            ),
          ],
        ),

        // Website Courses Mode Switcher Banner
        if (_modeInfo != null) _ModeBanner(info: _modeInfo!, busy: _modeBusy, fr: fr, onSwitch: _switchMode),
        if (_modeInfo != null) const SizedBox(height: 14),

        // 4 Clickable KPI Tiles
        if (s != null) ...[
          AdminGrid(
            minTileWidth: 155,
            maxColumns: 4,
            spacing: 10,
            children: [
              StatTile(
                label: fr ? 'Apprenants site' : 'Website learners',
                value: AdminFmt.number(context, s.learners),
                sub: fr ? '+${s.newWeek} cette semaine' : '+${s.newWeek} joined this week',
                icon: Icons.person_outline,
                color: const Color(0xFF4F46E5),
                onTap: () {
                  setState(() {
                    _tab = 'people';
                    _filter = _filter == 'learners' ? 'all' : 'learners';
                  });
                  _loadPeople(reset: true);
                },
              ),
              StatTile(
                label: fr ? 'Actifs (7 jours)' : 'Active (7 days)',
                value: AdminFmt.number(context, s.active7d),
                sub: fr ? '${s.totalPeople} comptes au total' : '${s.totalPeople} total accounts',
                icon: Icons.bolt,
                color: const Color(0xFF2563EB),
                onTap: () {
                  setState(() {
                    _tab = 'people';
                    _sort = _sort == 'seen_desc' ? 'recent' : 'seen_desc';
                  });
                  _loadPeople(reset: true);
                },
              ),
              StatTile(
                label: fr ? 'Forfaits payants' : 'Paid plans',
                value: AdminFmt.number(context, s.premiumPeople),
                sub: '${s.standardPeople} Standard · ${s.premiumTierPeople} Premium',
                icon: Icons.workspace_premium_outlined,
                color: AppColors.good,
                onTap: () {
                  setState(() {
                    _tab = 'people';
                    _filter = _filter == 'premium' ? 'all' : 'premium';
                  });
                  _loadPeople(reset: true);
                },
              ),
              StatTile(
                label: fr ? 'Demandes ouvertes' : 'Open requests',
                value: AdminFmt.number(context, s.openRequests),
                sub: s.openRequests > 0 ? (fr ? 'En attente' : 'Waiting for review') : (fr ? 'Tout est traité' : 'All caught up'),
                icon: Icons.notifications_active_outlined,
                color: s.openRequests > 0 ? AppColors.warn : AppColors.textMuted,
                onTap: () {
                  setState(() {
                    _tab = 'people';
                    _filter = _filter == 'requests' ? 'all' : 'requests';
                  });
                  _loadPeople(reset: true);
                },
              ),
            ],
          ),
          const SizedBox(height: 16),
        ],

        // Primary 3-Tab Switcher
        Container(
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: AppColors.pureWhite,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: AppColors.border),
          ),
          child: SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _TabPill(
                  selected: _tab == 'people',
                  icon: Icons.people_outline,
                  label: fr ? 'Personnes' : 'People',
                  count: s?.totalPeople,
                  alertCount: s?.openRequests ?? 0,
                  onTap: () => setState(() => _tab = 'people'),
                ),
                const SizedBox(width: 6),
                _TabPill(
                  selected: _tab == 'companies',
                  icon: Icons.apartment_outlined,
                  label: fr ? 'Entreprises' : 'Companies',
                  count: _orgs?.length,
                  onTap: () {
                    setState(() => _tab = 'companies');
                    if (_orgs == null) _loadOrgs();
                  },
                ),
                const SizedBox(width: 6),
                _TabPill(
                  selected: _tab == 'payments',
                  icon: Icons.credit_card_outlined,
                  label: fr ? 'Forfaits & paiements' : 'Plans & payments',
                  onTap: () => setState(() => _tab = 'payments'),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),

        if (_tab == 'people') _buildPeopleTab(fr) else if (_tab == 'companies') _buildCompaniesTab(fr) else OnlineBillingTab(learnMode: _modeInfo?.mode, refreshSignal: _billingRefresh),
      ],
    );
  }

  Widget _buildPeopleTab(bool fr) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AdminCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AdminSearchField(
                controller: _searchCtrl,
                hint: fr ? 'Nom, e-mail, WhatsApp ou entreprise' : 'Search name, email, WhatsApp or company',
                onChanged: (v) {
                  _debounce?.cancel();
                  _debounce = Timer(const Duration(milliseconds: 280), () {
                    setState(() => _query = v.trim());
                    _loadPeople(reset: true);
                  });
                },
              ),
              const SizedBox(height: 10),
              AdminFilterChips<String>(
                selected: _filter,
                options: [
                  FilterOption('all', fr ? 'Tous' : 'All'),
                  FilterOption('learners', fr ? 'Apprenants site' : 'Website learners'),
                  FilterOption('portal', fr ? 'Étudiants & entrep.' : 'Students & companies'),
                  FilterOption('premium', fr ? 'Payants' : 'Paid plans'),
                  FilterOption('requests', fr ? 'Demandes' : 'Requests', count: (_stats?.openRequests ?? 0) > 0 ? _stats!.openRequests : null),
                ],
                onSelected: (v) {
                  setState(() => _filter = v);
                  _loadPeople(reset: true);
                },
              ),
              const SizedBox(height: 10),
              LayoutBuilder(builder: (context, c) {
                final narrow = c.maxWidth < 460;
                final dropW = narrow ? (c.maxWidth - 8) / 2 : 178.0;
                return Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    _MiniDropdown<String>(
                      width: dropW,
                      value: _tier,
                      items: [
                        FilterOption('', fr ? 'Accès : Tous' : 'Access: All tiers'),
                        const FilterOption('premium', 'Premium'),
                        const FilterOption('standard', 'Standard'),
                        FilterOption('free', fr ? 'Gratuit' : 'Free website'),
                        FilterOption('off', fr ? 'Site off' : 'Website off'),
                      ],
                      onChanged: (v) {
                        setState(() => _tier = v ?? '');
                        _loadPeople(reset: true);
                      },
                    ),
                    _MiniDropdown<String>(
                      width: dropW,
                      value: _level,
                      items: [
                        FilterOption('', fr ? 'Niveau : Tous' : 'Level: All CEFR'),
                        FilterOption('beginner', fr ? 'Débutant' : 'Beginner'),
                        const FilterOption('A1', 'A1'),
                        const FilterOption('A2', 'A2'),
                        const FilterOption('B1', 'B1'),
                        const FilterOption('B2', 'B2'),
                        const FilterOption('C1', 'C1'),
                        const FilterOption('C2', 'C2'),
                        FilterOption('none', fr ? 'Non défini' : 'Not set'),
                      ],
                      onChanged: (v) {
                        setState(() => _level = v ?? '');
                        _loadPeople(reset: true);
                      },
                    ),
                    _MiniDropdown<String>(
                      width: dropW,
                      value: _source,
                      items: [
                        FilterOption('', fr ? 'Origine : Toutes' : 'Source: All accounts'),
                        FilterOption('google', fr ? 'Google' : 'Google sign-up'),
                        FilterOption('email', fr ? 'E-mail' : 'Email sign-up'),
                        FilterOption('portal', fr ? 'Portail / Entreprise' : 'Portal / Company'),
                      ],
                      onChanged: (v) {
                        setState(() => _source = v ?? '');
                        _loadPeople(reset: true);
                      },
                    ),
                    _MiniDropdown<String>(
                      width: dropW,
                      value: _sort,
                      items: [
                        FilterOption('recent', fr ? 'Tri : Demandes & récents' : 'Sort: Requests & newest'),
                        FilterOption('seen_desc', fr ? 'Tri : Actifs récemment' : 'Sort: Recently active'),
                        FilterOption('joined_desc', fr ? 'Tri : Plus récents' : 'Sort: Newest joined'),
                        FilterOption('joined_asc', fr ? 'Tri : Plus anciens' : 'Sort: Oldest joined'),
                        FilterOption('name_asc', fr ? 'Tri : Nom A → Z' : 'Sort: Name A → Z'),
                      ],
                      onChanged: (v) {
                        setState(() => _sort = v ?? 'recent');
                        _loadPeople(reset: true);
                      },
                    ),
                    if (_hasExtraFilters)
                      TextButton(
                        onPressed: _resetFilters,
                        child: Text(fr ? 'Réinitialiser' : 'Reset filters', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700)),
                      ),
                    Text(
                      fr ? '$_peopleTotal compte${_peopleTotal > 1 ? 's' : ''}' : '$_peopleTotal ${_peopleTotal == 1 ? 'person' : 'people'}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w700),
                    ),
                  ],
                );
              }),
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (_peopleLoading && _people.isEmpty)
          const AdminLoading()
        else if (_peopleError != null && _people.isEmpty)
          AdminError(message: _peopleError!, onRetry: () => _loadPeople(reset: true))
        else if (_people.isEmpty)
          AdminEmpty(
            icon: Icons.person_search_outlined,
            title: fr ? 'Aucun compte trouvé' : 'No matching people',
            message: _hasExtraFilters
                ? (fr ? 'Modifiez ou effacez un filtre actif.' : 'Try clearing one of your active filters.')
                : (fr ? 'Les inscrits au site apparaîtront ici.' : 'Website learners will appear here when they sign up.'),
          )
        else ...[
          AdminGrid(
            minTileWidth: 330,
            maxColumns: 2,
            spacing: 12,
            children: [
              for (final row in _people)
                _PersonCard(
                  row: row,
                  fr: fr,
                  onTap: () => _openLearner(row.id),
                  onWhatsApp: () => _openWhatsApp(row.whatsapp),
                ),
            ],
          ),
          if (_people.length < _peopleTotal) ...[
            const SizedBox(height: 12),
            Center(
              child: AdminButton(
                fr ? 'Afficher plus (${_people.length}/$_peopleTotal)' : 'Show more (${_people.length}/$_peopleTotal)',
                primary: false,
                busy: _peopleLoading,
                onPressed: () {
                  setState(() => _page += 1);
                  _loadPeople();
                },
              ),
            ),
          ],
        ],
      ],
    );
  }

  Widget _buildCompaniesTab(bool fr) {
    if (_orgsLoading && _orgs == null) return const AdminLoading();
    if (_orgsError != null && _orgs == null) return AdminError(message: _orgsError!, onRetry: _loadOrgs);
    final all = _orgs ?? const <OnlineCompanyRow>[];
    final term = _orgSearch.trim().toLowerCase();
    final list = all.where((o) {
      if (term.isNotEmpty && !o.name.toLowerCase().contains(term)) return false;
      if (_orgFilter == 'paid' && !o.premium) return false;
      if (_orgFilter == 'free' && (o.premium || o.learnAccess != 'free')) return false;
      if (_orgFilter == 'off' && (o.premium || o.learnAccess != 'off')) return false;
      return true;
    }).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AdminCard(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              AdminSearchField(
                hint: fr ? 'Rechercher une entreprise' : 'Search company name',
                onChanged: (v) => setState(() => _orgSearch = v),
              ),
              const SizedBox(height: 10),
              AdminFilterChips<String>(
                selected: _orgFilter,
                options: [
                  FilterOption('all', fr ? 'Toutes' : 'All', count: all.length),
                  FilterOption('paid', fr ? 'Forfaits payants' : 'Paid plans'),
                  FilterOption('free', fr ? 'Accès gratuit' : 'Free access'),
                  FilterOption('off', fr ? 'Site off' : 'Website off'),
                ],
                onSelected: (v) => setState(() => _orgFilter = v),
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        if (list.isEmpty)
          AdminEmpty(
            icon: Icons.apartment_outlined,
            title: fr ? 'Aucune entreprise correspondante' : 'No matching companies',
            message: fr ? 'Modifiez votre recherche ou vos filtres.' : 'Try clearing your search or filter.',
          )
        else
          AdminGrid(
            minTileWidth: 330,
            maxColumns: 2,
            spacing: 12,
            children: [
              for (final org in list)
                _CompanyOnlineCard(
                  org: org,
                  fr: fr,
                  onWebsiteChanged: (v) async {
                    try {
                      await ref.read(apiClientProvider).put('/admin/learners/organizations/${org.id}/website', data: {'learn_access': v});
                      if (!mounted) return;
                      adminToast(context, fr ? 'Accès site enregistré' : 'Website access saved');
                      await _loadOrgs();
                    } catch (e) {
                      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
                    }
                  },
                  onGrant: () => _grantCompanyPlan(org),
                  onRevoke: () async {
                    final ok = await confirmAdmin(
                      context,
                      title: fr ? 'Terminer le forfait de ${org.name} ?' : 'End company plan for ${org.name}?',
                      message: fr ? 'L’accès payant de tous les apprenants de l’entreprise prendra fin.' : 'Paid website access for all learners of this company will end.',
                      confirmLabel: fr ? 'Terminer' : 'End',
                    );
                    if (!ok || !mounted) return;
                    try {
                      await ref.read(apiClientProvider).post(
                        '/admin/learners/organizations/${org.id}/premium/revoke',
                        data: {'reason': 'Ended by an administrator'},
                      );
                      if (!mounted) return;
                      adminToast(context, fr ? 'Forfait entreprise terminé' : 'Company plan ended');
                      await _loadOrgs();
                    } catch (e) {
                      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
                    }
                  },
                ),
            ],
          ),
      ],
    );
  }
}

class _ModeBanner extends StatelessWidget {
  final LearnModeInfo info;
  final bool busy;
  final bool fr;
  final ValueChanged<String> onSwitch;

  const _ModeBanner({required this.info, required this.busy, required this.fr, required this.onSwitch});

  @override
  Widget build(BuildContext context) {
    final free = info.isFree;
    final bg = free ? AppColors.goodBg : AppColors.adminAccentBg;
    final border = free ? AppColors.goodBorder : AppColors.adminAccentLine;
    final accent = free ? AppColors.good : AppColors.adminAccent;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: accent.withValues(alpha: 0.14), borderRadius: BorderRadius.circular(10)),
                child: Icon(free ? Icons.card_giftcard : Icons.workspace_premium, size: 19, color: accent),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 8,
                      runSpacing: 4,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        Text(fr ? 'Mode des cours du site' : 'Website courses mode', style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                        Pill(free ? (fr ? 'Gratuit pour tous' : 'Free for everyone') : 'Free · Standard · Premium', color: accent),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      (free
                              ? (fr ? 'Chaque leçon est ouverte à tous, avec ou sans compte. Aucun paiement.' : 'Every lesson is open to everyone, with or without an account. No payment.')
                              : (fr ? 'Gratuit : Module 1 · Standard : tous les cours · Premium : cours + Simulateur d’examen & IA.' : 'Free: Module 1 starters · Standard: all courses · Premium: courses + Exam Simulator & AI credits.')) +
                          (info.updatedAt != null
                              ? ' · ${fr ? 'Modifié le' : 'Changed'} ${AdminFmt.day(context, info.updatedAt)}${info.updatedBy.isNotEmpty ? ' ${fr ? 'par' : 'by'} ${info.updatedBy}' : ''}'
                              : ''),
                      style: AppTypography.caption.copyWith(color: AppColors.text),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SegmentedButton<String>(
            showSelectedIcon: false,
            style: SegmentedButton.styleFrom(
              padding: const EdgeInsets.symmetric(horizontal: 8),
            ),
            selected: {info.mode},
            onSelectionChanged: busy ? null : (v) => onSwitch(v.first),
            segments: [
              ButtonSegment(
                value: 'free',
                icon: const Icon(Icons.card_giftcard, size: 16),
                label: Text(fr ? 'Gratuit' : 'Free for all', overflow: TextOverflow.ellipsis, maxLines: 1),
              ),
              ButtonSegment(
                value: 'premium',
                icon: const Icon(Icons.workspace_premium, size: 16),
                label: Text(fr ? 'Forfaits payants' : 'Paid Plans', overflow: TextOverflow.ellipsis, maxLines: 1),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _TabPill extends StatelessWidget {
  final bool selected;
  final IconData icon;
  final String label;
  final int? count;
  final int alertCount;
  final VoidCallback onTap;

  const _TabPill({
    required this.selected,
    required this.icon,
    required this.label,
    this.count,
    this.alertCount = 0,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.adminAccentBg : Colors.transparent,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(10),
            border: selected ? Border.all(color: AppColors.adminAccentLine) : null,
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(icon, size: 16, color: selected ? AppColors.adminAccent : AppColors.textMuted),
              const SizedBox(width: 6),
              Text(
                label,
                style: AppTypography.bodySmall.copyWith(
                  fontWeight: FontWeight.w700,
                  color: selected ? AppColors.adminAccent : AppColors.text,
                ),
              ),
              if (count != null) ...[
                const SizedBox(width: 6),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: selected ? AppColors.adminAccent : AppColors.surfaceSoft,
                    borderRadius: BorderRadius.circular(99),
                  ),
                  child: Text(
                    '$count',
                    style: AppTypography.caption.copyWith(fontSize: 11, fontWeight: FontWeight.w800, color: selected ? AppColors.pureWhite : AppColors.textMuted),
                  ),
                ),
              ],
              if (alertCount > 0) ...[
                const SizedBox(width: 4),
                Pill('$alertCount', color: AppColors.warn, solid: true),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _MiniDropdown<T> extends StatelessWidget {
  final double width;
  final T value;
  final List<FilterOption<T>> items;
  final ValueChanged<T?> onChanged;

  const _MiniDropdown({required this.width, required this.value, required this.items, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: width,
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: AppColors.surfaceSoft,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<T>(
          value: items.any((i) => i.value == value) ? value : items.first.value,
          isExpanded: true,
          isDense: true,
          style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
          items: [
            for (final o in items)
              DropdownMenuItem(
                value: o.value,
                child: Text(o.label, overflow: TextOverflow.ellipsis, maxLines: 1),
              ),
          ],
          onChanged: onChanged,
        ),
      ),
    );
  }
}

class _PersonCard extends StatelessWidget {
  final LearnerRow row;
  final bool fr;
  final VoidCallback onTap;
  final VoidCallback onWhatsApp;

  const _PersonCard({required this.row, required this.fr, required this.onTap, required this.onWhatsApp});

  @override
  Widget build(BuildContext context) {
    final hasRequest = row.requestId != null;
    final waDigits = OnlineFmt.whatsappDigits(row.whatsapp);

    return Material(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: hasRequest ? AppColors.warnBorder : AppColors.border, width: hasRequest ? 1.5 : 1),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  InitialsAvatar(row.fullName, size: 40, color: OnlineFmt.roleColor(row.role)),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Wrap(
                          spacing: 6,
                          runSpacing: 4,
                          crossAxisAlignment: WrapCrossAlignment.center,
                          children: [
                            Text(row.fullName, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
                            if (row.frenchLevel.isNotEmpty)
                              Pill(OnlineFmt.levelLabel(row.frenchLevel, fr), color: OnlineFmt.levelColor(row.frenchLevel)),
                            if (!row.isActive) Pill(fr ? 'Suspendu' : 'Suspended', color: AppColors.bad, solid: true),
                          ],
                        ),
                        const SizedBox(height: 2),
                        Row(
                          children: [
                            Flexible(
                              child: Text(row.email, style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
                            ),
                            if (row.googleLinked) ...[
                              const SizedBox(width: 5),
                              const Icon(Icons.g_mobiledata, size: 18, color: AppColors.textMuted),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.chevron_right, color: AppColors.textSubtle, size: 20),
                ],
              ),
              const SizedBox(height: 10),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                crossAxisAlignment: WrapCrossAlignment.center,
                children: [
                  if (row.premium)
                    Pill(
                      row.premiumTier == 'standard' ? 'Standard' : 'Premium',
                      color: row.premiumTier == 'standard' ? const Color(0xFF2563EB) : AppColors.frenchGold,
                      icon: row.premiumTier == 'standard' ? Icons.layers_outlined : Icons.workspace_premium,
                      solid: true,
                    )
                  else
                    Pill(
                      row.hasWebsiteAccess ? (fr ? 'Gratuit' : 'Free') : (fr ? 'Site off' : 'Website off'),
                      color: row.hasWebsiteAccess ? AppColors.good : AppColors.textMuted,
                    ),
                  Pill(OnlineFmt.roleLabel(row.role, fr), color: OnlineFmt.roleColor(row.role)),
                  if (row.organization.isNotEmpty) Pill(row.organization, color: const Color(0xFF0F766E), icon: Icons.apartment_outlined),
                ],
              ),
              if (row.premium || row.lastSeenAt != null || waDigits.length >= 7) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 10,
                  runSpacing: 6,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    if (row.premium)
                      Text(
                        (row.premiumUntil != null
                                ? (fr ? 'Jusqu’au ${AdminFmt.dayShort(context, row.premiumUntil)}' : 'Until ${AdminFmt.dayShort(context, row.premiumUntil)}')
                                : (fr ? 'Sans fin' : 'No end date')) +
                            (row.premiumViaCompany ? (fr ? ' · Entreprise' : ' · Company') : ''),
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      ),
                    if (row.lastSeenAt != null)
                      Text(
                        '${fr ? 'Vu' : 'Active'} ${AdminFmt.relative(context, row.lastSeenAt)}',
                        style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                      ),
                    if (waDigits.length >= 7)
                      InkWell(
                        onTap: onWhatsApp,
                        borderRadius: BorderRadius.circular(14),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: const Color(0xFFF0FDF4),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: const Color(0xFFBBF7D0)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.chat_outlined, size: 13, color: Color(0xFF15803D)),
                              const SizedBox(width: 4),
                              Text(row.whatsapp, style: AppTypography.caption.copyWith(color: const Color(0xFF15803D), fontWeight: FontWeight.w700)),
                            ],
                          ),
                        ),
                      ),
                  ],
                ),
              ],
              if (hasRequest) ...[
                const SizedBox(height: 8),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: AppColors.warnBg,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.warnBorder),
                  ),
                  child: Text(
                    '${fr ? 'Demandé le' : 'Asked'} ${AdminFmt.dayShort(context, row.requestedAt)}${row.requestMessage.isNotEmpty ? ' · “${row.requestMessage}”' : ''}',
                    style: AppTypography.caption.copyWith(color: const Color(0xFF92400E), fontWeight: FontWeight.w600),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

class _CompanyOnlineCard extends StatelessWidget {
  final OnlineCompanyRow org;
  final bool fr;
  final ValueChanged<String> onWebsiteChanged;
  final VoidCallback onGrant;
  final VoidCallback onRevoke;

  const _CompanyOnlineCard({
    required this.org,
    required this.fr,
    required this.onWebsiteChanged,
    required this.onGrant,
    required this.onRevoke,
  });

  @override
  Widget build(BuildContext context) {
    return AdminCard(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(
            children: [
              InitialsAvatar(org.name, size: 38, color: const Color(0xFF0F766E)),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Wrap(
                      spacing: 6,
                      runSpacing: 4,
                      children: [
                        Text(org.name, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
                        if (org.status == 'suspended') Pill(fr ? 'Suspendue' : 'Suspended', color: AppColors.bad, solid: true),
                      ],
                    ),
                    Text(
                      fr ? '${org.accounts} compte${org.accounts > 1 ? 's' : ''}' : '${org.accounts} ${org.accounts == 1 ? 'account' : 'accounts'}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
              if (org.premium)
                Pill(
                  org.premiumTier == 'standard' ? 'Standard' : 'Premium',
                  color: org.premiumTier == 'standard' ? const Color(0xFF2563EB) : AppColors.frenchGold,
                  solid: true,
                )
              else
                Pill(fr ? 'Sans forfait' : 'No plan', color: AppColors.textMuted),
            ],
          ),
          if (org.premium) ...[
            const SizedBox(height: 6),
            Text(
              org.premiumUntil != null
                  ? (fr ? 'Actif jusqu’au ${AdminFmt.day(context, org.premiumUntil)}' : 'Active until ${AdminFmt.day(context, org.premiumUntil)}')
                  : (fr ? 'Sans date de fin' : 'No end date'),
              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
            ),
          ],
          const SizedBox(height: 12),
          AdminSelect<String>(
            label: fr ? 'Accès site (tous les apprenants)' : 'Website access (all learners)',
            value: org.learnAccess,
            options: [
              FilterOption('off', fr ? 'Désactivé (portail uniquement)' : 'Off (portal only)'),
              FilterOption('free', fr ? 'Compte site gratuit' : 'Free website account'),
            ],
            onChanged: (v) {
              if (v != null && v != org.learnAccess) onWebsiteChanged(v);
            },
          ),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              AdminButton(
                org.premium ? (fr ? 'Changer le forfait' : 'Change plan') : (fr ? 'Activer un forfait' : 'Activate plan'),
                icon: Icons.workspace_premium_outlined,
                onPressed: onGrant,
              ),
              if (org.premium)
                AdminButton(
                  fr ? 'Terminer' : 'End',
                  icon: Icons.block,
                  primary: false,
                  danger: true,
                  onPressed: onRevoke,
                ),
            ],
          ),
        ],
      ),
    );
  }
}
