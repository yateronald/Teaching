import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import '../common/admin_state.dart';
import 'demo_detail_panel.dart';
import 'demo_model.dart';

/// Requests for a free demo from the website: the pipeline from "new" to
/// "completed", with everything the visitor answered.
class DemoRequestsScreen extends ConsumerStatefulWidget {
  const DemoRequestsScreen({super.key});

  @override
  ConsumerState<DemoRequestsScreen> createState() => _DemoRequestsScreenState();
}

class _DemoRequestsScreenState extends ConsumerState<DemoRequestsScreen> {
  static const _pageSize = 20;
  List<Map<String, dynamic>> _items = [];
  Map<String, dynamic> _stats = {};
  int _total = 0;
  int _page = 1;
  bool _loading = true;
  bool _loadingMore = false;
  String? _error;
  String? _status;
  String? _interest;
  String _search = '';
  Timer? _debounce;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }

  Map<String, dynamic> _query(int page) => {
        'page': page,
        'limit': _pageSize,
        if (_status != null) 'status': _status,
        if (_interest != null) 'interest': _interest,
        if (_search.trim().isNotEmpty) 'search': _search.trim(),
      };

  Future<void> _load() async {
    setState(() {
      _loading = _items.isEmpty;
      _error = null;
    });
    try {
      final res = await ref.read(apiClientProvider).get('/demo-requests', queryParameters: _query(1));
      final data = J.map(res.data);
      if (!mounted) return;
      final stats = J.map(data['statistics']);
      ref.read(newDemoRequestsProvider.notifier).state = J.i(stats['new_requests']);
      setState(() {
        _items = J.list(data['data']);
        _stats = stats;
        _total = J.i(J.map(data['pagination'])['total']);
        _page = 1;
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

  Future<void> _more() async {
    setState(() => _loadingMore = true);
    try {
      final res = await ref.read(apiClientProvider).get('/demo-requests', queryParameters: _query(_page + 1));
      if (!mounted) return;
      setState(() {
        _items = [..._items, ...J.list(J.map(res.data)['data'])];
        _page++;
      });
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _loadingMore = false);
    }
  }

  void _onSearch(String v) {
    _search = v;
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 350), _load);
  }

  Future<void> _open(Map<String, dynamic> d) async {
    await showAdminPanel(context, builder: (_) => DemoDetailPanel(request: d, onChanged: _load));
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_loading) return const AdminLoading();
    if (_error != null && _items.isEmpty && _stats.isEmpty) return AdminError(message: _error!, onRetry: _load);

    final pipeline = [
      FilterOption<String?>(null, fr ? 'Toutes' : 'All', count: J.i(_stats['total'])),
      for (final s in Demo.statuses) FilterOption<String?>(s, Demo.statusLabel(s, fr), count: J.i(_stats[Demo.statKey[s]])),
    ];
    final interests = [
      FilterOption<String?>(null, fr ? 'Tous les besoins' : 'Any need'),
      FilterOption<String?>('classes', Demo.interestLabel('classes', fr)),
      FilterOption<String?>('exam', Demo.interestLabel('exam', fr)),
    ];

    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          AdminSearchField(hint: fr ? 'Nom ou e-mail' : 'Name or email', onChanged: _onSearch),
          const SizedBox(height: 10),
          AdminFilterChips<String?>(
            options: pipeline,
            selected: _status,
            onSelected: (v) {
              setState(() => _status = v);
              _load();
            },
          ),
          const SizedBox(height: 6),
          AdminFilterChips<String?>(
            options: interests,
            selected: _interest,
            onSelected: (v) {
              setState(() => _interest = v);
              _load();
            },
          ),
        ],
      ),
      children: [
        AdminGrid(
          minTileWidth: 150,
          maxColumns: 4,
          spacing: 10,
          children: [
            StatTile(label: fr ? 'Nouvelles' : 'New', value: '${J.i(_stats['new_requests'])}', sub: fr ? 'À contacter' : 'To contact', icon: Icons.fiber_new_outlined, color: AppColors.warn),
            StatTile(label: fr ? 'Cette semaine' : 'This week', value: '${J.i(_stats['this_week'])}', sub: fr ? '${J.i(_stats['this_month'])} ce mois-ci' : '${J.i(_stats['this_month'])} this month', icon: Icons.date_range_outlined),
            StatTile(label: fr ? 'Démos planifiées' : 'Demos scheduled', value: '${J.i(_stats['demo_scheduled'])}', icon: Icons.event_available_outlined, color: const Color(0xFF7C3AED)),
            StatTile(
              label: fr ? 'Taux de conversion' : 'Completion rate',
              value: J.i(_stats['total']) == 0 ? '—' : '${(J.i(_stats['completed']) * 100 / J.i(_stats['total'])).round()}%',
              sub: fr ? '${J.i(_stats['completed'])} démos faites' : '${J.i(_stats['completed'])} demos held',
              icon: Icons.trending_up,
              color: AppColors.good,
            ),
          ],
        ),
        const SizedBox(height: 16),
        Text(
          fr ? '$_total demande${_total == 1 ? '' : 's'}' : '$_total request${_total == 1 ? '' : 's'}',
          style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 10),
        if (_items.isEmpty)
          AdminCard(
            child: AdminEmpty(
              icon: Icons.support_agent_outlined,
              title: fr ? 'Aucune demande' : 'No demo requests',
              message: fr ? 'Les demandes du site apparaîtront ici.' : 'Requests from the website appear here.',
            ),
          )
        else
          AdminGrid(
            minTileWidth: 340,
            maxColumns: 2,
            spacing: 10,
            children: [for (final d in _items) _DemoCard(d: d, onTap: () => _open(d))],
          ),
        if (_items.length < _total)
          Padding(
            padding: const EdgeInsets.only(top: 14),
            child: Center(
              child: AdminButton(fr ? 'Afficher plus' : 'Show more', primary: false, busy: _loadingMore, onPressed: _more),
            ),
          ),
      ],
    );
  }
}

class _DemoCard extends StatelessWidget {
  final Map<String, dynamic> d;
  final VoidCallback onTap;
  const _DemoCard({required this.d, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final status = J.s(d['status']);
    final name = J.s(d['full_name']);
    final teacher = J.name(d, first: 'teacher_first_name', last: 'teacher_last_name');
    final scheduled = J.date(d['demo_scheduled_at']);
    final meta = [
      if (J.s(d['country']).isNotEmpty) J.s(d['country']),
      if (J.s(d['current_level']).isNotEmpty) J.s(d['current_level']),
      if (Demo.interestLabel(J.s(d['interest']), fr).isNotEmpty) Demo.interestLabel(J.s(d['interest']), fr),
    ].join(' · ');
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
            border: Border.all(color: status == 'new' ? AppColors.warnBorder : AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  InitialsAvatar(name, size: 38),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(name, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink), maxLines: 1, overflow: TextOverflow.ellipsis),
                        Text(J.s(d['email']), style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 1, overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  Pill(Demo.statusLabel(status, fr), color: Demo.statusColor(status), icon: Demo.statusIcon(status)),
                ],
              ),
              if (meta.isNotEmpty) ...[
                const SizedBox(height: 10),
                Text(meta, style: AppTypography.caption.copyWith(color: AppColors.text, fontWeight: FontWeight.w600)),
              ],
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(scheduled != null ? Icons.event : Icons.schedule, size: 14, color: AppColors.textSubtle),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      scheduled != null
                          ? '${Demo.passed(d) ? (fr ? 'Démo faite' : 'Held') : (fr ? 'Démo' : 'Demo')} ${AdminFmt.weekdayDay(context, scheduled)} · ${AdminFmt.time(context, scheduled)}${teacher.isNotEmpty ? ' · $teacher' : ''}'
                          : '${fr ? 'Reçue' : 'Received'} ${AdminFmt.relative(context, J.date(d['created_at']))}',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
