import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'company_detail_panel.dart';
import 'company_editor_panel.dart';
import 'company_model.dart';

/// The companies (organizations): each has its managers, a package of
/// learner accounts, access dates, allowed exams and a reserve of AI credits.
class CompaniesScreen extends ConsumerStatefulWidget {
  const CompaniesScreen({super.key});

  @override
  ConsumerState<CompaniesScreen> createState() => _CompaniesScreenState();
}

class _CompaniesScreenState extends ConsumerState<CompaniesScreen> {
  List<Company> _companies = [];
  bool _loading = true;
  String? _error;
  String _search = '';
  String _state = 'all';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = _companies.isEmpty;
      _error = null;
    });
    try {
      final res = await ref.read(apiClientProvider).get('/admin/organizations');
      if (!mounted) return;
      setState(() {
        _companies = J.list(res.data).map(Company.fromJson).toList();
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

  bool _matches(Company c, String state) {
    switch (state) {
      case 'active':
        return c.state == 'active';
      case 'ending':
        return c.state == 'active' && c.expiringSoon;
      case 'expired':
        return c.state == 'expired';
      case 'suspended':
        return c.state == 'suspended';
      case 'not_started':
        return c.state == 'not_started';
      default:
        return true;
    }
  }

  List<Company> get _filtered {
    final q = _search.trim().toLowerCase();
    return _companies.where((c) {
      if (!_matches(c, _state)) return false;
      if (q.isEmpty) return true;
      return '${c.name} ${c.displayName ?? ''} ${c.slug}'.toLowerCase().contains(q);
    }).toList();
  }

  Future<void> _create() async {
    final id = await showAdminPanel<int>(context, builder: (_) => const CompanyEditorPanel());
    if (id == null || !mounted) return;
    await _load();
    if (id > 0 && mounted) await _open(id);
  }

  Future<void> _open(int id) async {
    await showAdminPanel(context, tabletWidth: 640, builder: (_) => CompanyDetailPanel(companyId: id));
    if (mounted) _load();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _companies.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final list = _filtered;
    int count(String s) => _companies.where((c) => _matches(c, s)).length;
    final states = [
      FilterOption('all', fr ? 'Toutes' : 'All', count: _companies.length),
      FilterOption('active', fr ? 'Actives' : 'Active', count: count('active')),
      FilterOption('ending', fr ? 'Se terminent bientôt' : 'Ending soon', count: count('ending')),
      FilterOption('expired', fr ? 'Expirées' : 'Expired', count: count('expired')),
      FilterOption('suspended', fr ? 'Désactivées' : 'Disabled', count: count('suspended')),
      if (count('not_started') > 0) FilterOption('not_started', fr ? 'Pas commencées' : 'Not started', count: count('not_started')),
    ];
    final learners = _companies.fold<int>(0, (t, c) => t + c.activeLearners);
    final ee = _companies.fold<int>(0, (t, c) => t + c.ee.reserve);
    final eo = _companies.fold<int>(0, (t, c) => t + c.eo.reserve);

    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Row(children: [
            Expanded(
              child: AdminSearchField(
                hint: fr ? 'Rechercher une entreprise' : 'Search a company',
                onChanged: (v) => setState(() => _search = v),
              ),
            ),
            const SizedBox(width: 10),
            AdminButton(fr ? 'Nouvelle' : 'New', key: const Key('companies-new'), icon: Icons.add_business_outlined, onPressed: _create),
          ]),
          const SizedBox(height: 10),
          AdminFilterChips<String>(options: states, selected: _state, onSelected: (v) => setState(() => _state = v)),
        ],
      ),
      children: [
        AdminHeader(
          overline: fr ? 'Gestion' : 'Management',
          title: fr ? 'Entreprises' : 'Companies',
          subtitle: fr
              ? 'Chaque entreprise gère ses apprenants dans les limites que vous fixez : forfait, dates, examens et crédits.'
              : 'Each company manages its learners within the limits you set: package, dates, exams and credits.',
        ),
        AdminGrid(minTileWidth: 150, maxColumns: 4, spacing: 10, children: [
          StatTile(label: fr ? 'Entreprises' : 'Companies', value: '${_companies.length}', sub: fr ? '${count('active')} active(s)' : '${count('active')} active', icon: Icons.apartment_outlined),
          StatTile(label: fr ? 'Apprenants actifs' : 'Active learners', value: '$learners', icon: Icons.groups_outlined, color: AppColors.good),
          StatTile(label: fr ? 'Réserves EE / EO' : 'EE / EO reserves', value: '$ee / $eo', icon: Icons.bolt, color: const Color(0xFFB45309)),
          StatTile(
            label: fr ? 'À surveiller' : 'Needs attention',
            value: '${count('ending') + count('expired')}',
            sub: fr ? 'Fin proche ou expirées' : 'Ending soon or expired',
            icon: Icons.event_busy,
            color: AppColors.warn,
            onTap: count('ending') + count('expired') == 0 ? null : () => setState(() => _state = count('ending') > 0 ? 'ending' : 'expired'),
          ),
        ]),
        const SizedBox(height: 16),
        if (list.isEmpty)
          AdminEmpty(
            icon: Icons.apartment_outlined,
            title: _companies.isEmpty ? (fr ? 'Aucune entreprise' : 'No company yet') : (fr ? 'Aucun résultat' : 'No match'),
            message: _companies.isEmpty
                ? (fr ? 'Créez une entreprise : son responsable reçoit une invitation par e-mail.' : 'Create a company: its manager receives an invitation by email.')
                : null,
          )
        else
          AdminGrid(minTileWidth: 300, maxColumns: 3, spacing: 12, children: [
            for (final c in list) _CompanyCard(company: c, onTap: () => _open(c.id)),
          ]),
      ],
    );
  }
}

class _CompanyCard extends StatelessWidget {
  final Company company;
  final VoidCallback onTap;
  const _CompanyCard({required this.company, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final c = company;
    final full = c.seatsLeft == 0;
    final ratio = c.seatLimit == 0 ? 0.0 : (c.seatsUsed / c.seatLimit).clamp(0.0, 1.0);
    return Material(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Row(children: [
              CompanyLogo(company: c, size: 40),
              const SizedBox(width: 10),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(c.name, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink), maxLines: 1, overflow: TextOverflow.ellipsis),
                  Text(
                    fr ? 'Jusqu’au ${AdminFmt.day(context, c.endsAt)}' : 'Until ${AdminFmt.day(context, c.endsAt)}',
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  ),
                ]),
              ),
              Pill(c.stateLabel(fr), color: c.stateColor),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Text(fr ? 'Forfait' : 'Package', style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600)),
              const Spacer(),
              Text(
                '${c.seatsUsed} / ${c.seatLimit}',
                style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: full ? AppColors.warn : AppColors.ink),
              ),
            ]),
            const SizedBox(height: 4),
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: ratio,
                minHeight: 6,
                backgroundColor: AppColors.surfaceSoft,
                color: full ? AppColors.warn : AppColors.adminAccent,
              ),
            ),
            const SizedBox(height: 10),
            Wrap(spacing: 6, runSpacing: 6, children: [
              Pill('EE ${c.ee.reserve}', color: const Color(0xFFB45309), icon: Icons.bolt),
              Pill('EO ${c.eo.reserve}', color: const Color(0xFFBE123C), icon: Icons.bolt),
              Pill(fr ? '${c.managers} responsable(s)' : '${c.managers} manager(s)', color: AppColors.textMuted, icon: Icons.badge_outlined),
            ]),
          ]),
        ),
      ),
    );
  }
}
