import 'dart:async';
import 'dart:math' as math;
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'world_map.dart';

/// Who visits the public website, from where, and how fast it is for them,
/// next to the health of the platform. Aggregates only: no visitor is stored.
class MonitoringScreen extends ConsumerStatefulWidget {
  const MonitoringScreen({super.key});

  @override
  ConsumerState<MonitoringScreen> createState() => _MonitoringScreenState();
}

class _MonitoringScreenState extends ConsumerState<MonitoringScreen> {
  String _tab = 'overview';
  String _range = '7d';
  final Map<String, Map<String, dynamic>> _data = {};
  bool _loading = true;
  bool _denied = false;
  String? _error;
  Timer? _timer;
  DateTime? _refreshed;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  String get _path => switch (_tab) {
        'overview' => '/monitoring/overview?range=$_range',
        'geo' => '/monitoring/geo?range=$_range',
        'performance' => '/monitoring/performance?range=$_range',
        _ => '/monitoring/live',
      };

  Future<void> _load({bool silent = false}) async {
    if (!silent) {
      setState(() {
        _loading = true;
        _error = null;
      });
    }
    final tab = _tab;
    try {
      final res = await ref.read(apiClientProvider).get(_path);
      if (!mounted) return;
      setState(() {
        _data[tab] = J.map(res.data);
        _loading = false;
        _refreshed = DateTime.now();
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        if (e is ApiException && e.statusCode == 403) {
          _denied = true;
        } else if (!silent) {
          _error = apiErrorText(context, e);
        }
      });
    }
    _timer?.cancel();
    if (_tab == 'live' && mounted) {
      _timer = Timer(const Duration(seconds: 20), () {
        if (mounted && _tab == 'live') _load(silent: true);
      });
    }
  }

  void _switch(String tab) {
    setState(() => _tab = tab);
    _load();
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    if (_denied) {
      return AdminEmpty(
        icon: Icons.lock_outline,
        title: fr ? 'Accès réservé' : 'Restricted access',
        message: fr ? 'Seuls les administrateurs ayant la clé de suivi peuvent ouvrir cet espace.' : 'Only administrators holding the monitoring key can open this space.',
      );
    }
    final d = _data[_tab];
    // Four tabs with icons do not fit a small phone: text only there.
    final narrow = MediaQuery.sizeOf(context).width < 480;
    return AdminPage(
      onRefresh: _load,
      toolbar: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          SegmentedButton<String>(
            segments: [
              ButtonSegment(value: 'overview', icon: narrow ? null : const Icon(Icons.area_chart_outlined, size: 18), label: Text(fr ? 'Audience' : 'Audience')),
              ButtonSegment(value: 'geo', icon: narrow ? null : const Icon(Icons.public, size: 18), label: Text(fr ? 'Pays' : 'Countries')),
              ButtonSegment(value: 'performance', icon: narrow ? null : const Icon(Icons.bolt, size: 18), label: Text(fr ? 'Vitesse' : 'Speed')),
              ButtonSegment(value: 'live', icon: narrow ? null : const Icon(Icons.sensors, size: 18), label: Text(fr ? 'Direct' : 'Live')),
            ],
            selected: {_tab},
            showSelectedIcon: false,
            onSelectionChanged: (v) => _switch(v.first),
          ),
          if (_tab != 'live') ...[
            const SizedBox(height: 8),
            AdminFilterChips<String>(
              options: [
                FilterOption('24h', fr ? '24 h' : '24h'),
                FilterOption('7d', fr ? '7 jours' : '7 days'),
                FilterOption('30d', fr ? '30 jours' : '30 days'),
                FilterOption('90d', fr ? '90 jours' : '90 days'),
              ],
              selected: _range,
              onSelected: (v) {
                setState(() => _range = v);
                _load();
              },
            ),
          ],
        ],
      ),
      children: [
        if (_loading && d == null)
          const AdminLoading()
        else if (_error != null && d == null)
          AdminError(message: _error!, onRetry: _load)
        else if (d != null && d['ready'] == false)
          AdminCard(child: AdminEmpty(icon: Icons.hourglass_empty, title: fr ? 'Pas encore de données' : 'No data yet', message: fr ? 'Les premières visites apparaîtront ici.' : 'The first visits will appear here.'))
        else if (d != null) ...[
          if (_tab == 'overview') _Overview(d: d),
          if (_tab == 'geo') _Geo(d: d),
          if (_tab == 'performance') _Performance(d: d),
          if (_tab == 'live') _Live(d: d, refreshed: _refreshed),
        ],
      ],
    );
  }
}

// ── Shared bits ────────────────────────────────────────────────────────────

String _flag(String? code) {
  if (code == null || code.length != 2 || code == '??') return '🌐';
  final up = code.toUpperCase();
  final a = up.codeUnitAt(0), b = up.codeUnitAt(1);
  if (a < 65 || a > 90 || b < 65 || b > 90) return '🌐';
  return String.fromCharCodes([0x1F1E6 + a - 65, 0x1F1E6 + b - 65]);
}

const _countries = {
  'CA': ('Canada', 'Canada'), 'FR': ('France', 'France'), 'US': ('États-Unis', 'United States'), 'GB': ('Royaume-Uni', 'United Kingdom'),
  'BE': ('Belgique', 'Belgium'), 'CH': ('Suisse', 'Switzerland'), 'IN': ('Inde', 'India'), 'PK': ('Pakistan', 'Pakistan'),
  'BD': ('Bangladesh', 'Bangladesh'), 'NP': ('Népal', 'Nepal'), 'LK': ('Sri Lanka', 'Sri Lanka'), 'PH': ('Philippines', 'Philippines'),
  'CN': ('Chine', 'China'), 'JP': ('Japon', 'Japan'), 'KR': ('Corée du Sud', 'South Korea'), 'VN': ('Viêt Nam', 'Vietnam'),
  'AE': ('Émirats arabes unis', 'United Arab Emirates'), 'SA': ('Arabie saoudite', 'Saudi Arabia'), 'QA': ('Qatar', 'Qatar'),
  'MA': ('Maroc', 'Morocco'), 'DZ': ('Algérie', 'Algeria'), 'TN': ('Tunisie', 'Tunisia'), 'EG': ('Égypte', 'Egypt'),
  'SN': ('Sénégal', 'Senegal'), 'CI': ("Côte d'Ivoire", "Côte d'Ivoire"), 'CM': ('Cameroun', 'Cameroon'), 'NG': ('Nigéria', 'Nigeria'),
  'GH': ('Ghana', 'Ghana'), 'KE': ('Kenya', 'Kenya'), 'CD': ('RD Congo', 'DR Congo'), 'CG': ('Congo', 'Congo'), 'BJ': ('Bénin', 'Benin'),
  'TG': ('Togo', 'Togo'), 'BF': ('Burkina Faso', 'Burkina Faso'), 'ML': ('Mali', 'Mali'), 'GN': ('Guinée', 'Guinea'),
  'ZA': ('Afrique du Sud', 'South Africa'), 'MU': ('Maurice', 'Mauritius'), 'MG': ('Madagascar', 'Madagascar'),
  'DE': ('Allemagne', 'Germany'), 'ES': ('Espagne', 'Spain'), 'IT': ('Italie', 'Italy'), 'PT': ('Portugal', 'Portugal'),
  'NL': ('Pays-Bas', 'Netherlands'), 'IE': ('Irlande', 'Ireland'), 'PL': ('Pologne', 'Poland'), 'RO': ('Roumanie', 'Romania'),
  'UA': ('Ukraine', 'Ukraine'), 'RU': ('Russie', 'Russia'), 'TR': ('Turquie', 'Turkey'), 'IR': ('Iran', 'Iran'), 'LB': ('Liban', 'Lebanon'),
  'BR': ('Brésil', 'Brazil'), 'MX': ('Mexique', 'Mexico'), 'CO': ('Colombie', 'Colombia'), 'AR': ('Argentine', 'Argentina'),
  'HT': ('Haïti', 'Haiti'), 'AU': ('Australie', 'Australia'), 'NZ': ('Nouvelle-Zélande', 'New Zealand'), 'SG': ('Singapour', 'Singapore'),
  'MY': ('Malaisie', 'Malaysia'), 'ID': ('Indonésie', 'Indonesia'), 'TH': ('Thaïlande', 'Thailand'), 'LU': ('Luxembourg', 'Luxembourg'),
};

String _country(String? code, bool fr) {
  if (code == null || code.isEmpty || code == '??') return fr ? 'Inconnu' : 'Unknown';
  final n = _countries[code.toUpperCase()];
  return n == null ? code.toUpperCase() : (fr ? n.$1 : n.$2);
}

String _duration(num seconds) {
  final s = seconds.round();
  if (s < 60) return '$s s';
  return '${s ~/ 60} min ${(s % 60).toString().padLeft(2, '0')}';
}

String _uptime(int s) {
  final d = s ~/ 86400, h = (s % 86400) ~/ 3600, m = (s % 3600) ~/ 60;
  if (d > 0) return '${d}d $h h';
  if (h > 0) return '$h h $m min';
  return '$m min';
}

String _ms(num? v) => v == null ? '—' : v >= 1000 ? '${(v / 1000).toStringAsFixed(1)} s' : '${v.round()} ms';

class _Delta extends StatelessWidget {
  final num? change;
  final bool lowerIsBetter;
  const _Delta(this.change, {this.lowerIsBetter = false});

  @override
  Widget build(BuildContext context) {
    if (change == null) return const SizedBox.shrink();
    final up = change! >= 0;
    final good = lowerIsBetter ? !up : up;
    return Text('${up ? '▲' : '▼'} ${change!.abs().round()}%', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800, color: good ? AppColors.good : AppColors.bad));
  }
}

class _Bars extends StatelessWidget {
  final List<(String, num)> rows;
  final String Function(num)? value;
  final Color color;
  const _Bars(this.rows, {this.value, this.color = AppColors.adminAccent});

  @override
  Widget build(BuildContext context) {
    if (rows.isEmpty) return Text('—', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted));
    final max = rows.map((r) => r.$2).fold<num>(1, math.max);
    return Column(
      children: [
        for (final r in rows)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 5),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(child: Text(r.$1, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w600, color: AppColors.text), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    Text(value?.call(r.$2) ?? AdminFmt.number(context, r.$2), style: AppTypography.caption.copyWith(fontWeight: FontWeight.w800)),
                  ],
                ),
                const SizedBox(height: 3),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(value: (r.$2 / max).toDouble(), minHeight: 5, color: color, backgroundColor: AppColors.borderSoft),
                ),
              ],
            ),
          ),
      ],
    );
  }
}

// ── Audience ───────────────────────────────────────────────────────────────

class _Overview extends StatelessWidget {
  final Map<String, dynamic> d;
  const _Overview({required this.d});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final k = J.map(d['kpis']);
    final change = J.map(k['change']);
    final series = J.list(d['series']);
    final hourly = J.s(J.map(d['range'])['bucket']) == 'hour';
    List<(String, num)> named(dynamic list, [String key = 'name']) => [for (final r in J.list(list).take(8)) (J.s(r[key]).isEmpty ? '—' : J.s(r[key]), J.n(r['visits']))];
    String channel(String c) => {
          'direct': fr ? 'Direct' : 'Direct',
          'search': fr ? 'Moteurs de recherche' : 'Search engines',
          'social': fr ? 'Réseaux sociaux' : 'Social',
          'referral': fr ? 'Sites référents' : 'Referrals',
          'campaign': fr ? 'Campagnes' : 'Campaigns',
          'email': 'E-mail',
        }[c] ??
        c;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AdminGrid(
          minTileWidth: 150,
          maxColumns: 5,
          spacing: 10,
          children: [
            _Kpi(fr ? 'Visites' : 'Visits', AdminFmt.number(context, J.n(k['visits'])), _Delta(change['visits'] as num?)),
            _Kpi(fr ? 'Visiteurs' : 'Visitors', AdminFmt.number(context, J.n(k['visitors'])), _Delta(change['visitors'] as num?)),
            _Kpi(fr ? 'Sessions' : 'Sessions', AdminFmt.number(context, J.n(k['sessions'])), _Delta(change['sessions'] as num?)),
            _Kpi(fr ? 'Taux de rebond' : 'Bounce rate', '${J.n(k['bounce_rate']).round()}%', _Delta(change['bounce_rate'] as num?, lowerIsBetter: true)),
            _Kpi(fr ? 'Durée moyenne' : 'Avg. time', _duration(J.n(k['avg_seconds'])), _Delta(change['avg_seconds'] as num?)),
          ],
        ),
        if (J.i(k['live_visitors']) > 0)
          Padding(
            padding: const EdgeInsets.only(top: 10),
            child: Row(
              children: [
                const Icon(Icons.fiber_manual_record, size: 12, color: AppColors.good),
                const SizedBox(width: 6),
                Flexible(
                  child: Text(fr ? '${J.i(k['live_visitors'])} visiteur(s) en ce moment' : '${J.i(k['live_visitors'])} visitor(s) right now', style: AppTypography.bodySmall.copyWith(color: AppColors.good, fontWeight: FontWeight.w700)),
                ),
              ],
            ),
          ),
        const SizedBox(height: 14),
        AdminCard(
          title: fr ? 'Visites' : 'Visits',
          icon: Icons.show_chart,
          action: Row(mainAxisSize: MainAxisSize.min, children: [
            _Key(AppColors.adminAccent, fr ? 'Visites' : 'Visits'),
            const SizedBox(width: 10),
            _Key(AppColors.good, fr ? 'Visiteurs' : 'Visitors'),
          ]),
          child: Container(
            height: 180,
            padding: const EdgeInsets.only(right: 14),
            child: series.isEmpty
                ? const Center(child: Text('—'))
                : LineChart(
                    LineChartData(
                      minY: 0,
                      gridData: FlGridData(show: true, drawVerticalLine: false, getDrawingHorizontalLine: (_) => const FlLine(color: AppColors.borderSoft, strokeWidth: 1)),
                      borderData: FlBorderData(show: false),
                      titlesData: FlTitlesData(
                        topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                        leftTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: true, reservedSize: 32, getTitlesWidget: (v, _) => Text('${v.round()}', style: AppTypography.caption.copyWith(fontSize: 9.5, color: AppColors.textSubtle))),
                        ),
                        bottomTitles: AxisTitles(
                          sideTitles: SideTitles(
                            showTitles: true,
                            reservedSize: 20,
                            interval: math.max(1, (series.length / 5).ceilToDouble()),
                            getTitlesWidget: (v, _) {
                              final i = v.round();
                              if (i < 0 || i >= series.length) return const SizedBox.shrink();
                              final at = J.date(series[i]['at']);
                              return Text(
                                at == null ? '' : DateFormat(hourly ? 'HH:mm' : 'd MMM', fr ? 'fr_FR' : 'en_US').format(at),
                                style: AppTypography.caption.copyWith(fontSize: 9.5, color: AppColors.textSubtle),
                              );
                            },
                          ),
                        ),
                      ),
                      lineBarsData: [
                        LineChartBarData(
                          spots: [for (var i = 0; i < series.length; i++) FlSpot(i.toDouble(), J.n(series[i]['visits']).toDouble())],
                          isCurved: true,
                          preventCurveOverShooting: true,
                          color: AppColors.adminAccent,
                          barWidth: 2.5,
                          dotData: const FlDotData(show: false),
                          belowBarData: BarAreaData(show: true, color: AppColors.adminAccent.withValues(alpha: 0.08)),
                        ),
                        LineChartBarData(
                          spots: [for (var i = 0; i < series.length; i++) FlSpot(i.toDouble(), J.n(series[i]['visitors']).toDouble())],
                          isCurved: true,
                          preventCurveOverShooting: true,
                          color: AppColors.good,
                          barWidth: 2,
                          dotData: const FlDotData(show: false),
                        ),
                      ],
                    ),
                  ),
          ),
        ),
        const SizedBox(height: 14),
        AdminGrid(
          minTileWidth: 320,
          maxColumns: 2,
          children: [
            AdminCard(
              title: fr ? 'Pages les plus vues' : 'Top pages',
              icon: Icons.article_outlined,
              child: _Bars([for (final p in J.list(d['pages']).take(8)) (J.s(p['path']), J.n(p['visits']))]),
            ),
            AdminCard(
              title: fr ? "D'où ils viennent" : 'Where they come from',
              icon: Icons.alt_route,
              child: _Bars([for (final c in J.list(d['channels'])) (channel(J.s(c['channel'])), J.n(c['visits']))], color: const Color(0xFF0891B2)),
            ),
            AdminCard(
              title: fr ? 'Pays' : 'Countries',
              icon: Icons.public,
              child: _Bars([for (final c in J.list(d['countries']).take(8)) ('${_flag(J.s(c['country']))}  ${_country(J.s(c['country']), fr)}', J.n(c['visits']))], color: AppColors.good),
            ),
            AdminCard(title: fr ? 'Sites référents' : 'Referrers', icon: Icons.link, child: _Bars(named(d['referrers'], 'host'), color: const Color(0xFF7C3AED))),
            AdminCard(title: fr ? 'Appareils' : 'Devices', icon: Icons.devices_other, child: _Bars(named(d['devices']), color: AppColors.warn)),
            AdminCard(title: fr ? 'Navigateurs' : 'Browsers', icon: Icons.web, child: _Bars(named(d['browsers']), color: const Color(0xFF2563EB))),
            AdminCard(title: fr ? 'Systèmes' : 'Systems', icon: Icons.computer, child: _Bars(named(d['systems']), color: const Color(0xFF0D9488))),
            AdminCard(title: fr ? 'Langues' : 'Languages', icon: Icons.translate, child: _Bars(named(d['languages']), color: const Color(0xFFDB2777))),
            if (J.list(d['campaigns']).isNotEmpty)
              AdminCard(
                title: fr ? 'Campagnes' : 'Campaigns',
                icon: Icons.campaign_outlined,
                child: _Bars([
                  for (final c in J.list(d['campaigns']).take(8))
                    ([J.s(c['name']), J.s(c['source']), J.s(c['medium'])].where((s) => s.isNotEmpty).join(' · '), J.n(c['visits'])),
                ]),
              ),
          ],
        ),
      ],
    );
  }
}

class _Key extends StatelessWidget {
  final Color color;
  final String label;
  const _Key(this.color, this.label);

  @override
  Widget build(BuildContext context) => Row(mainAxisSize: MainAxisSize.min, children: [
        Container(width: 10, height: 3, decoration: BoxDecoration(color: color, borderRadius: BorderRadius.circular(2))),
        const SizedBox(width: 4),
        Text(label, style: AppTypography.caption.copyWith(fontSize: 11, color: AppColors.textMuted)),
      ]);
}

class _Kpi extends StatelessWidget {
  final String label;
  final String value;
  final Widget delta;
  const _Kpi(this.label, this.value, this.delta);

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(14), border: Border.all(color: AppColors.border)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600)),
            const SizedBox(height: 4),
            FittedBox(fit: BoxFit.scaleDown, child: Text(value, style: AppTypography.headlineSmall.copyWith(fontWeight: FontWeight.w800))),
            const SizedBox(height: 2),
            delta,
          ],
        ),
      );
}

// ── Countries ──────────────────────────────────────────────────────────────

class _Geo extends StatefulWidget {
  final Map<String, dynamic> d;
  const _Geo({required this.d});

  @override
  State<_Geo> createState() => _GeoState();
}

class _GeoState extends State<_Geo> {
  MapMeasure _measure = MapMeasure.visitors;
  String? _code;
  String? _name;

  void _pick(String? code, String name) => setState(() {
        final same = code != null && code == _code;
        _code = same ? null : code;
        _name = same ? null : name;
      });

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final d = widget.d;
    final t = J.map(d['totals']);
    final list = J.list(d['countries']);
    final byCode = {for (final c in list) J.s(c['country']).toUpperCase(): c};
    final ranked = [for (final c in list) if (J.s(c['country']) != '??') c].take(10).toList();
    final unplaced = byCode['??'];
    final picked = _code == null ? null : byCode[_code];
    String nameOf(String code, [String? fallback]) => _countries.containsKey(code) ? _country(code, fr) : (fallback ?? code);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AdminGrid(
          minTileWidth: 150,
          maxColumns: 4,
          spacing: 10,
          children: [
            StatTile(label: fr ? 'Pays' : 'Countries', value: '${J.i(t['countries'])}', sub: fr ? 'atteints sur la période' : 'reached in this period', icon: Icons.public),
            StatTile(
              label: fr ? 'Visiteurs' : 'Visitors',
              value: AdminFmt.number(context, J.n(t['visitors'])),
              sub: fr ? '${AdminFmt.number(context, J.n(t['visits']))} pages vues' : '${AdminFmt.number(context, J.n(t['visits']))} page views',
              icon: Icons.people_outline,
              color: const Color(0xFF0891B2),
            ),
            if (ranked.isNotEmpty)
              StatTile(
                label: fr ? 'Plus grande audience' : 'Largest audience',
                value: '${_flag(J.s(ranked.first['country']))} ${nameOf(J.s(ranked.first['country']).toUpperCase())}',
                sub: fr ? '${J.n(ranked.first['share'])} % des pages vues' : '${J.n(ranked.first['share'])}% of page views',
                icon: Icons.emoji_events_outlined,
                color: AppColors.good,
              ),
            if (unplaced != null)
              StatTile(
                label: fr ? 'Non localisées' : 'Not placed',
                value: AdminFmt.number(context, J.n(unplaced['visits'])),
                sub: fr ? '${J.n(unplaced['share'])} % des pages vues' : '${J.n(unplaced['share'])}% of page views',
                icon: Icons.help_outline,
                color: AppColors.textMuted,
              ),
          ],
        ),
        const SizedBox(height: 14),
        AdminCard(
          title: fr ? 'Où sont les visiteurs' : 'Where visitors are',
          icon: Icons.map_outlined,
          padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            SegmentedButton<MapMeasure>(
              showSelectedIcon: false,
              style: const ButtonStyle(visualDensity: VisualDensity.compact),
              segments: [
                ButtonSegment(value: MapMeasure.visitors, label: Text(fr ? 'Visiteurs' : 'Visitors')),
                ButtonSegment(value: MapMeasure.visits, label: Text(fr ? 'Pages vues' : 'Page views')),
                ButtonSegment(value: MapMeasure.speed, label: Text(fr ? 'Vitesse' : 'Speed')),
              ],
              selected: {_measure},
              onSelectionChanged: (s) => setState(() => _measure = s.first),
            ),
            const SizedBox(height: 10),
            VisitorWorldMap(byCode: byCode, measure: _measure, selected: _code, onPick: (p) => _pick(p.code, p.name)),
            const SizedBox(height: 8),
            Row(children: [
              Expanded(
                child: Text(
                  fr ? 'Pincez pour zoomer · touchez un pays' : 'Pinch to zoom · tap a country',
                  style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 11),
                ),
              ),
              MapLegend(measure: _measure),
            ]),
          ]),
        ),
        const SizedBox(height: 12),
        AdminCard(
          title: _code == null ? (fr ? 'Choisissez un pays' : 'Pick a country') : (fr ? 'Pays' : 'Country'),
          icon: Icons.flag_outlined,
          action: _code == null ? null : AdminLink(fr ? 'Effacer' : 'Clear', onTap: () => setState(() => _code = _name = null)),
          child: _code == null
              ? Text(fr ? 'Touchez un pays sur la carte ou dans le classement.' : 'Tap a country on the map or in the ranking.',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))
              : _CountryCard(code: _code!, name: nameOf(_code!, _name), c: picked),
        ),
        const SizedBox(height: 12),
        AdminCard(
          title: fr ? 'Pays les plus actifs' : 'Top countries',
          icon: Icons.leaderboard_outlined,
          child: ranked.isEmpty
              ? Text(fr ? 'Aucune visite localisée pour l’instant.' : 'No visit has been placed yet.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted))
              : Column(children: [
                  for (final c in ranked)
                    _RankRow(
                      flag: _flag(J.s(c['country'])),
                      name: nameOf(J.s(c['country']).toUpperCase()),
                      visits: J.n(c['visits']),
                      max: J.n(ranked.first['visits']),
                      share: J.n(c['share']),
                      speed: _ms(c['load_p75'] as num?),
                      picked: J.s(c['country']).toUpperCase() == _code,
                      onTap: () => _pick(J.s(c['country']).toUpperCase(), nameOf(J.s(c['country']).toUpperCase())),
                    ),
                ]),
        ),
        const SizedBox(height: 14),
        PanelSection(fr ? 'Tous les pays' : 'All countries'),
        for (final c in list)
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: AdminCard(
              padding: const EdgeInsets.all(12),
              child: Theme(
                data: Theme.of(context).copyWith(dividerColor: Colors.transparent),
                child: ExpansionTile(
                  tilePadding: EdgeInsets.zero,
                  childrenPadding: const EdgeInsets.only(bottom: 4),
                  leading: Text(_flag(J.s(c['country'])), style: const TextStyle(fontSize: 26)),
                  title: Text(_country(J.s(c['country']), fr), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
                  subtitle: Text(
                    fr
                        ? '${AdminFmt.number(context, J.n(c['visits']))} visites · ${J.n(c['share']).toStringAsFixed(1)} % · ${AdminFmt.number(context, J.n(c['visitors']))} visiteurs'
                        : '${AdminFmt.number(context, J.n(c['visits']))} visits · ${J.n(c['share']).toStringAsFixed(1)}% · ${AdminFmt.number(context, J.n(c['visitors']))} visitors',
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  ),
                  children: [
                    Wrap(
                      spacing: 18,
                      runSpacing: 8,
                      children: [
                        _Fact(fr ? 'Rebond' : 'Bounce', '${J.n(c['bounce_rate']).round()}%'),
                        _Fact(fr ? 'Durée' : 'Avg. time', _duration(J.n(c['avg_seconds']))),
                        _Fact(fr ? 'Chargement (p75)' : 'Load (p75)', _ms(c['load_p75'] as num?)),
                        _Fact('LCP (p75)', _ms(c['lcp_p75'] as num?)),
                        _Fact(fr ? 'Téléphone / tablette / ordi' : 'Phone / tablet / desktop', '${J.i(c['phone'])} / ${J.i(c['tablet'])} / ${J.i(c['desktop'])}'),
                        _Fact(fr ? 'Recherche / réseaux / campagnes' : 'Search / social / campaigns', '${J.i(c['search'])} / ${J.i(c['social'])} / ${J.i(c['campaign'])}'),
                        if (J.s(c['top_page']).isNotEmpty) _Fact(fr ? 'Page favorite' : 'Top page', J.s(c['top_page'])),
                        if (c['seconds_since_last'] != null)
                          _Fact(fr ? 'Dernière visite' : 'Last visit', AdminFmt.relative(context, DateTime.now().subtract(Duration(seconds: J.i(c['seconds_since_last']))))),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ),
      ],
    );
  }
}

/// Everything known about the picked country (as the web's country card).
class _CountryCard extends StatelessWidget {
  final String code;
  final String name;
  final Map<String, dynamic>? c;
  const _CountryCard({required this.code, required this.name, required this.c});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final c = this.c;
    final head = Row(children: [
      Text(_flag(code), style: const TextStyle(fontSize: 30)),
      const SizedBox(width: 10),
      Expanded(
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(name, style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
          Text(
            c == null
                ? (fr ? 'Aucune visite depuis ce pays sur la période.' : 'No visit from here in this period.')
                : (fr ? '${J.n(c['share'])} % des pages vues de la période' : '${J.n(c['share'])}% of all page views in this period'),
            style: AppTypography.caption.copyWith(color: AppColors.textMuted),
          ),
        ]),
      ),
    ]);
    if (c == null) return head;
    final devices = J.n(c['visits']) == 0 ? 0 : ((J.n(c['phone']) + J.n(c['tablet'])) / J.n(c['visits']) * 100).round();
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      head,
      const SizedBox(height: 12),
      Wrap(spacing: 18, runSpacing: 10, children: [
        _Fact(fr ? 'Visiteurs' : 'Visitors', AdminFmt.number(context, J.n(c['visitors']))),
        _Fact(fr ? 'Pages vues' : 'Page views', AdminFmt.number(context, J.n(c['visits']))),
        _Fact(fr ? 'Visites' : 'Visits', AdminFmt.number(context, J.n(c['sessions']))),
        _Fact(fr ? 'Rebond' : 'Bounce rate', '${J.n(c['bounce_rate']).round()}%'),
        _Fact(fr ? 'Temps sur la page' : 'Time on page', _duration(J.n(c['avg_seconds']))),
        _Fact(fr ? 'Chargement' : 'Page load', _ms(c['load_p75'] as num?)),
        _Fact(fr ? 'Plus grand rendu' : 'Largest paint', _ms(c['lcp_p75'] as num?)),
        _Fact(fr ? 'Premier octet' : 'First byte', _ms(c['ttfb_p75'] as num?)),
      ]),
      const SizedBox(height: 10),
      Text(
        fr ? '$devices % téléphone ou tablette · ${100 - devices} % ordinateur' : '$devices% phone or tablet · ${100 - devices}% computer',
        style: AppTypography.caption.copyWith(color: AppColors.text),
      ),
      if (J.s(c['top_page']).isNotEmpty) ...[
        const SizedBox(height: 4),
        Text('${fr ? 'Page la plus lue' : 'Most read'} : ${J.s(c['top_page'])}', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
      ],
    ]);
  }
}

class _RankRow extends StatelessWidget {
  final String flag;
  final String name;
  final num visits;
  final num max;
  final num share;
  final String speed;
  final bool picked;
  final VoidCallback onTap;
  const _RankRow({required this.flag, required this.name, required this.visits, required this.max, required this.share, required this.speed, required this.picked, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(8),
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 2),
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 7),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: picked ? const Color(0xFF4338CA) : Colors.transparent),
        ),
        child: Stack(children: [
          Positioned.fill(
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: max == 0 ? 0 : (visits / max).clamp(0.0, 1.0).toDouble(),
              child: Container(decoration: BoxDecoration(color: const Color(0xFFE8EAFF), borderRadius: BorderRadius.circular(6))),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            child: Row(children: [
              Text(flag, style: const TextStyle(fontSize: 18)),
              const SizedBox(width: 8),
              Expanded(child: Text(name, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink), overflow: TextOverflow.ellipsis)),
              Text(speed, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
              const SizedBox(width: 10),
              Text(AdminFmt.number(context, visits), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800)),
              const SizedBox(width: 6),
              SizedBox(width: 38, child: Text('$share%', textAlign: TextAlign.right, style: AppTypography.caption.copyWith(color: AppColors.textMuted))),
            ]),
          ),
        ]),
      ),
    );
  }
}

class _Fact extends StatelessWidget {
  final String label;
  final String value;
  const _Fact(this.label, this.value);

  @override
  Widget build(BuildContext context) => Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11)),
          Text(value, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700)),
        ],
      );
}

// ── Performance ────────────────────────────────────────────────────────────

class _Performance extends StatelessWidget {
  final Map<String, dynamic> d;
  const _Performance({required this.d});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final api = J.map(d['api']);
    final health = J.map(d['health']);
    Color rating(String r) => r == 'good' ? AppColors.good : r == 'fair' ? AppColors.warn : r == 'poor' ? AppColors.bad : AppColors.textSubtle;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AdminCard(
          title: fr ? 'Signaux web essentiels (p75)' : 'Core web vitals (p75)',
          icon: Icons.speed,
          child: AdminGrid(
            minTileWidth: 150,
            maxColumns: 4,
            spacing: 10,
            children: [
              for (final v in J.list(d['vitals']))
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: rating(J.s(v['rating'])).withValues(alpha: 0.06), borderRadius: BorderRadius.circular(12), border: Border.all(color: rating(J.s(v['rating'])).withValues(alpha: 0.3))),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(J.s(v['label']).isEmpty ? J.s(v['key']).toUpperCase() : J.s(v['label']), style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 4),
                      Text(
                        v['p75'] == null ? '—' : J.s(v['unit']) == 'score' ? (J.n(v['p75']) / 1000).toStringAsFixed(3) : _ms(J.n(v['p75'])),
                        style: AppTypography.titleLarge.copyWith(fontWeight: FontWeight.w800, color: rating(J.s(v['rating']))),
                      ),
                      Text(fr ? '${J.i(v['samples'])} mesures' : '${J.i(v['samples'])} samples', style: AppTypography.caption.copyWith(fontSize: 11, color: AppColors.textMuted)),
                      const SizedBox(height: 6),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(3),
                        child: SizedBox(
                          height: 6,
                          child: Row(children: [
                            if (J.i(v['good_count']) > 0) Expanded(flex: J.i(v['good_count']), child: Container(color: AppColors.good)),
                            if (J.i(v['fair_count']) > 0) Expanded(flex: J.i(v['fair_count']), child: Container(color: AppColors.warn)),
                            if (J.i(v['poor_count']) > 0) Expanded(flex: J.i(v['poor_count']), child: Container(color: AppColors.bad)),
                            if (J.i(v['good_count']) + J.i(v['fair_count']) + J.i(v['poor_count']) == 0) Expanded(child: Container(color: AppColors.borderSoft)),
                          ]),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ),
        const SizedBox(height: 14),
        AdminGrid(
          minTileWidth: 320,
          maxColumns: 2,
          children: [
            AdminCard(
              title: fr ? 'Pages les plus lentes' : 'Slowest pages',
              icon: Icons.hourglass_bottom,
              child: _Bars([for (final p in J.list(d['slowest']).take(8)) (J.s(p['path']), J.n(p['lcp_p75']))], value: _ms, color: AppColors.warn),
            ),
            AdminCard(
              title: fr ? 'API de la plateforme' : 'Platform API',
              icon: Icons.dns_outlined,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  Wrap(
                    spacing: 18,
                    runSpacing: 8,
                    children: [
                      _Fact(fr ? 'Requêtes' : 'Requests', AdminFmt.number(context, J.n(api['requests']))),
                      _Fact(fr ? 'Temps moyen' : 'Average', _ms(J.n(api['avg_ms']))),
                      _Fact('p95', _ms(J.n(api['p95_ms']))),
                      _Fact(fr ? 'Erreurs serveur' : 'Server errors', '${J.i(api['server_errors'])} (${J.n(api['error_rate']).toStringAsFixed(2)}%)'),
                    ],
                  ),
                  const SizedBox(height: 10),
                  _Bars([for (final r in J.list(api['routes']).take(6)) ('${J.s(r['method'])} ${J.s(r['route'])}', J.n(r['p95_ms']))], value: _ms, color: const Color(0xFF7C3AED)),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        AdminCard(
          title: fr ? 'Santé du serveur' : 'Server health',
          icon: Icons.monitor_heart_outlined,
          child: Wrap(
            spacing: 22,
            runSpacing: 10,
            children: [
              _Fact(fr ? 'En ligne depuis' : 'Up for', _uptime(J.i(health['uptime_seconds']))),
              _Fact(fr ? 'Mémoire' : 'Memory', '${J.n(health['memory_mb']).round()} MB'),
              _Fact('Heap', '${J.n(health['heap_used_mb']).round()} / ${J.n(health['heap_total_mb']).round()} MB'),
              _Fact(fr ? 'Latence boucle' : 'Event loop lag', _ms(J.n(health['event_loop_lag_ms']))),
              _Fact('Node', J.s(health['node'])),
              _Fact(fr ? 'Conservation' : 'Retention', fr ? '${J.i(d['retention_days'])} jours' : '${J.i(d['retention_days'])} days'),
            ],
          ),
        ),
      ],
    );
  }
}

// ── Live ───────────────────────────────────────────────────────────────────

class _Live extends StatelessWidget {
  final Map<String, dynamic> d;
  final DateTime? refreshed;
  const _Live({required this.d, required this.refreshed});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final minutes = J.list(d['minutes']);
    final maxV = minutes.map((m) => J.n(m['visits'])).fold<num>(1, math.max);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AdminGrid(
          minTileWidth: 150,
          maxColumns: 2,
          spacing: 10,
          children: [
            StatTile(label: fr ? 'Visiteurs en ce moment' : 'Visitors right now', value: '${J.i(d['visitors'])}', icon: Icons.sensors, color: AppColors.good),
            StatTile(label: fr ? 'Pages vues (30 min)' : 'Page views (30 min)', value: '${J.i(d['views'])}', icon: Icons.visibility_outlined),
          ],
        ),
        if (refreshed != null)
          Padding(
            padding: const EdgeInsets.only(top: 8),
            child: Text(fr ? 'Actualisé à ${AdminFmt.time(context, refreshed)} · toutes les 20 s' : 'Updated ${AdminFmt.time(context, refreshed)} · every 20 s', style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
          ),
        const SizedBox(height: 14),
        AdminCard(
          title: fr ? 'Dernières 30 minutes' : 'Last 30 minutes',
          icon: Icons.timeline,
          child: SizedBox(
            height: 90,
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                for (final m in minutes)
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 1),
                      child: Container(
                        height: math.max(2, 80 * J.n(m['visits']) / maxV).toDouble(),
                        decoration: BoxDecoration(color: AppColors.good.withValues(alpha: 0.75), borderRadius: BorderRadius.circular(2)),
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 14),
        AdminGrid(
          minTileWidth: 320,
          maxColumns: 2,
          children: [
            AdminCard(title: fr ? 'Pages ouvertes' : 'Pages open', icon: Icons.article_outlined, child: _Bars([for (final p in J.list(d['pages'])) (J.s(p['path']), J.n(p['visits']))])),
            AdminCard(
              title: fr ? 'Pays' : 'Countries',
              icon: Icons.public,
              child: _Bars([for (final c in J.list(d['countries'])) ('${_flag(J.s(c['country']))}  ${_country(J.s(c['country']), fr)}', J.n(c['visits']))], color: AppColors.good),
            ),
          ],
        ),
        const SizedBox(height: 14),
        AdminCard(
          title: fr ? 'Dernières visites' : 'Recent visits',
          icon: Icons.history,
          child: Column(
            children: [
              for (final r in J.list(d['recent']).take(20))
                ListTile(
                  dense: true,
                  contentPadding: EdgeInsets.zero,
                  leading: Text(_flag(J.s(r['country'])), style: const TextStyle(fontSize: 22)),
                  title: Text(J.s(r['path']), style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700), maxLines: 1, overflow: TextOverflow.ellipsis),
                  subtitle: Text(
                    [J.s(r['device']), J.s(r['browser']), J.s(r['referrer_host']).isEmpty ? J.s(r['channel']) : J.s(r['referrer_host'])].where((s) => s.isNotEmpty).join(' · '),
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  trailing: Text(
                    AdminFmt.relative(context, DateTime.now().subtract(Duration(seconds: J.i(r['seconds_ago'])))),
                    style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 11),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}
