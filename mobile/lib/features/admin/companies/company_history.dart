import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/api/api_client.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../common/admin_kit.dart';
import 'company_model.dart';

/// One change "before → after" of a history entry.
class HistoryChange {
  final String label;
  final String from;
  final String to;
  const HistoryChange(this.label, this.from, this.to);
}

/// A history entry in words.
class HistoryText {
  String title;
  final List<HistoryChange> changes = [];
  final List<String> facts = [];
  String? note;
  /// up (extension, addition), down (shortening, withdrawal), bad (disabled), neutral.
  String tone = 'neutral';
  HistoryText(this.title);
}

String _kinds(dynamic v, [String sign = '']) {
  final m = J.map(v);
  return [for (final t in const ['ee', 'eo']) if (J.i(m[t]) > 0) '$sign${J.i(m[t])} ${t.toUpperCase()}'].join(', ');
}

String _plural(int n, String one, String many) => '$n ${n == 1 ? one : many}';

/// Describes one entry of GET /admin/organizations/:id/history.
HistoryText describeHistory(BuildContext context, Map<String, dynamic> item) {
  final fr = context.isFrench;
  final d = J.map(item['details']);
  String day(dynamic v) => AdminFmt.day(context, J.date(v));
  final out = HistoryText(J.s(item['action']).replaceAll('_', ' '));
  // The reason typed with the change ("notes" is also a company field, whose change is a map).
  for (final v in [d['note'], d['notes']]) {
    if (v is String && v.trim().isNotEmpty) {
      out.note = v;
      break;
    }
  }
  final via = d['via'] == 'users_page' ? (fr ? ' (page Utilisateurs)' : ' (Users page)') : '';

  switch (J.s(item['action'])) {
    case 'company_created':
      out.title = fr ? 'Entreprise créée' : 'Company created';
      out.facts.addAll([
        fr ? 'Accès jusqu’au ${day(d['access_ends_at'])}' : 'Access until ${day(d['access_ends_at'])}',
        if (d['seat_limit'] != null) fr ? 'Forfait : ${J.i(d['seat_limit'])} comptes' : 'Package: ${J.i(d['seat_limit'])} accounts',
        if (_kinds({'ee': d['ee_credits'], 'eo': d['eo_credits']}).isNotEmpty)
          fr ? 'Crédits initiaux : ${_kinds({'ee': d['ee_credits'], 'eo': d['eo_credits']})}' : 'Initial credits: ${_kinds({'ee': d['ee_credits'], 'eo': d['eo_credits']})}',
      ]);
    case 'dates_changed':
      final end = J.map(d['access_ends_at']);
      final start = J.map(d['access_starts_at']);
      if (end.isNotEmpty) {
        final days = J.date(end['to'])!.difference(J.date(end['from'])!).inHours ~/ 24;
        out.tone = days >= 0 ? 'up' : 'down';
        out.title = days >= 0
            ? (fr ? 'Accès prolongé de ${_plural(days, 'jour', 'jours')}' : 'Access extended by ${_plural(days, 'day', 'days')}')
            : (fr ? 'Accès raccourci de ${_plural(-days, 'jour', 'jours')}' : 'Access shortened by ${_plural(-days, 'day', 'days')}');
        out.changes.add(HistoryChange(fr ? 'Fin de l’accès' : 'End of access', day(end['from']), day(end['to'])));
      } else {
        out.title = fr ? 'Début de l’accès déplacé' : 'Access start moved';
      }
      if (start.isNotEmpty) out.changes.add(HistoryChange(fr ? 'Début de l’accès' : 'Start of access', day(start['from']), day(start['to'])));
    case 'expiry_notice_sent':
      out.title = fr ? 'Avertissement d’expiration envoyé' : 'Expiry warning emailed';
      out.facts.add(fr ? '${J.i(d['days_left'])} jours avant la fin' : '${J.i(d['days_left'])} days before the end');
    case 'credits_granted':
    case 'credits_revoked':
      final add = item['action'] == 'credits_granted';
      out.tone = add ? 'up' : 'down';
      if (d['amounts'] is Map) {
        final a = _kinds(d['amounts'], add ? '+' : '−');
        out.title = add ? (fr ? 'Crédits ajoutés : $a' : 'Credits added: $a') : (fr ? 'Crédits retirés : $a' : 'Credits taken back: $a');
        final before = J.map(d['before']), after = J.map(d['reserve']), amounts = J.map(d['amounts']);
        for (final t in const ['ee', 'eo']) {
          if (J.i(amounts[t]) > 0) {
            out.changes.add(HistoryChange(fr ? 'Réserve ${t.toUpperCase()}' : '${t.toUpperCase()} reserve',
                before.containsKey(t) ? '${J.i(before[t])}' : '?', after.containsKey(t) ? '${J.i(after[t])}' : '?'));
          }
        }
      } else {
        final a = '${add ? '+' : '−'}${J.i(d['amount'])} ${J.s(d['type']).toUpperCase()}';
        out.title = add ? (fr ? 'Crédits ajoutés : $a' : 'Credits added: $a') : (fr ? 'Crédits retirés : $a' : 'Credits taken back: $a');
      }
    case 'credits_distributed':
      final a = d['amounts'] is Map ? _kinds(d['amounts']) : '${J.i(d['each'])}';
      out.title = fr ? 'L’entreprise a donné $a à chacun de ${J.i(d['learners'])} apprenant(s)' : 'The company gave $a to each of ${J.i(d['learners'])} learner(s)';
      if (_kinds(d['kept_in_reserve']).isNotEmpty) out.facts.add(fr ? '${_kinds(d['kept_in_reserve'])} gardé(s) en réserve' : '${_kinds(d['kept_in_reserve'])} kept in the reserve');
      if (J.s(d['assignment']).isNotEmpty) out.facts.add(fr ? 'Avec l’attribution « ${d['assignment']} »' : 'With the assignment “${d['assignment']}”');
    case 'credits_reclaimed':
      final a = d['returned'] is Map ? _kinds(d['returned']) : '${J.i(d['returned'])}';
      out.title = fr ? 'L’entreprise a récupéré ${a.isEmpty ? '0' : a} crédit(s)' : 'The company took back ${a.isEmpty ? '0' : a} credit(s)';
    case 'package_changed':
    case 'company_updated':
      final seat = J.map(d['seat_limit']);
      if (seat.isNotEmpty) {
        final up = J.i(seat['to']) >= J.i(seat['from']);
        out.tone = up ? 'up' : 'down';
        out.title = up ? (fr ? 'Forfait augmenté' : 'Package raised') : (fr ? 'Forfait réduit' : 'Package lowered');
        out.changes.add(HistoryChange(fr ? 'Comptes apprenants' : 'Learner accounts', '${J.i(seat['from'])}', '${J.i(seat['to'])}'));
      } else {
        out.title = fr ? 'Informations modifiées' : 'Details changed';
      }
      const labels = {'name': ['Nom officiel', 'Official name'], 'display_name': ['Nom affiché', 'Displayed name'], 'default_language': ['Langue', 'Language'], 'notes': ['Notes internes', 'Internal notes']};
      for (final e in labels.entries) {
        final c = J.map(d[e.key]);
        if (c.isNotEmpty) out.changes.add(HistoryChange(fr ? e.value[0] : e.value[1], J.s(c['from']).isEmpty ? '—' : J.s(c['from']), J.s(c['to']).isEmpty ? '—' : J.s(c['to'])));
      }
    case 'company_suspended':
      out.title = fr ? 'Entreprise désactivée' : 'Company disabled';
      out.tone = 'bad';
      out.facts.add(fr ? '${J.i(d['sessions_ended'])} session(s) terminée(s)' : '${J.i(d['sessions_ended'])} session(s) ended');
    case 'company_reactivated':
      out.title = fr ? 'Entreprise réactivée' : 'Company reactivated';
      out.tone = 'up';
    case 'content_changed':
      final added = J.list(d['added']), removed = J.list(d['removed']);
      out.title = fr ? 'Examens autorisés modifiés' : 'Allowed exams changed';
      if (added.isNotEmpty) out.facts.add('${fr ? 'Ajoutés' : 'Added'} : ${added.map((a) => J.s(a['name'])).join(', ')}');
      if (removed.isNotEmpty) out.facts.add('${fr ? 'Retirés' : 'Removed'} : ${removed.map((a) => J.s(a['name'])).join(', ')}');
      // Older entries only kept the counts; newer ones name what changed.
      if (added.isEmpty && removed.isEmpty && d['from'] != null) out.changes.add(HistoryChange(fr ? 'Éléments' : 'Items', '${J.i(d['from'])}', '${J.i(d['to'])}'));
    case 'account_deactivated':
    case 'account_reactivated':
      final on = item['action'] == 'account_reactivated';
      out.tone = on ? 'up' : 'down';
      out.title = '${on ? (fr ? 'Compte réactivé' : 'Account reactivated') : (fr ? 'Compte désactivé' : 'Account deactivated')}${J.s(d['email']).isEmpty ? '' : ' : ${d['email']}'}$via';
      if (_kinds(d['credits_returned']).isNotEmpty) out.facts.add(fr ? '${_kinds(d['credits_returned'])} rendus à la réserve' : '${_kinds(d['credits_returned'])} returned to the reserve');
    case 'account_deleted':
      out.tone = 'down';
      out.title = d['reason'] == 'never_used'
          ? '${fr ? 'Compte jamais utilisé supprimé' : 'Unused account deleted'} : ${J.s(d['email'])}$via'
          : '${fr ? 'Compte supprimé par un administrateur' : 'Account deleted by an administrator'} : ${J.s(d['email'])}$via';
      out.facts.add(fr ? 'Sa place dans le forfait a été libérée' : 'Its place in the package was freed');
      if (_kinds(d['credits_returned']).isNotEmpty) out.facts.add(fr ? '${_kinds(d['credits_returned'])} rendus à la réserve' : '${_kinds(d['credits_returned'])} returned to the reserve');
    case 'account_updated':
      out.title = '${fr ? 'Compte modifié' : 'Account changed'}${J.s(d['email']).isEmpty ? '' : ' : ${d['email']}'}$via';
      for (final e in J.map(d['changes']).entries) {
        final c = J.map(e.value);
        out.changes.add(HistoryChange(e.key, J.s(c['from']), J.s(c['to'])));
      }
    default:
      out.title = auditLineText(item, fr);
  }
  return out;
}

/// The company's history for the administrator: summary, filters, before → after.
class CompanyHistorySection extends ConsumerStatefulWidget {
  final Company company;
  const CompanyHistorySection({super.key, required this.company});

  @override
  ConsumerState<CompanyHistorySection> createState() => _CompanyHistorySectionState();
}

class _CompanyHistorySectionState extends ConsumerState<CompanyHistorySection> {
  Map<String, dynamic>? _summary;
  List<Map<String, dynamic>> _items = [];
  int? _next;
  String _category = 'all';
  bool _loading = true;
  bool _more = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void didUpdateWidget(covariant CompanyHistorySection old) {
    super.didUpdateWidget(old);
    // The company changed (extension, credits…): its history did too.
    if (!identical(old.company, widget.company)) _load();
  }

  Future<Map<String, dynamic>> _get({int? before}) async {
    final res = await ref.read(apiClientProvider).get('/admin/organizations/${widget.company.id}/history', queryParameters: {
      'limit': 30,
      if (_category != 'all') 'category': _category,
      'before': ?before,
    });
    return J.map(res.data);
  }

  Future<void> _load() async {
    setState(() {
      _loading = _items.isEmpty;
      _error = null;
    });
    try {
      final d = await _get();
      if (!mounted) return;
      setState(() {
        _summary = J.map(d['summary']);
        _items = J.list(d['items']);
        _next = d['next_before'] == null ? null : J.i(d['next_before']);
        _loading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _error = apiErrorText(context, e);
          _loading = false;
        });
      }
    }
  }

  Future<void> _loadMore() async {
    if (_next == null) return;
    setState(() => _more = true);
    try {
      final d = await _get(before: _next);
      if (!mounted) return;
      setState(() {
        _items = [..._items, ...J.list(d['items'])];
        _next = d['next_before'] == null ? null : J.i(d['next_before']);
      });
    } catch (e) {
      if (mounted) adminToast(context, apiErrorText(context, e), error: true);
    } finally {
      if (mounted) setState(() => _more = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    final s = _summary;
    final options = [
      FilterOption('all', fr ? 'Tout' : 'All'),
      FilterOption('access', fr ? 'Accès' : 'Access'),
      FilterOption('credits', fr ? 'Crédits (admin)' : 'Credits (admin)'),
      FilterOption('handouts', fr ? 'Crédits (entreprise)' : 'Credits (company)'),
      FilterOption('package', fr ? 'Forfait' : 'Package'),
      FilterOption('status', fr ? 'Statut' : 'Status'),
      FilterOption('exams', fr ? 'Examens' : 'Exams'),
      FilterOption('people', fr ? 'Personnes' : 'People'),
    ];
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      if (s != null) _summaryTiles(context, s),
      const SizedBox(height: 10),
      AdminFilterChips<String>(
        options: options,
        selected: _category,
        onSelected: (v) {
          setState(() {
            _category = v;
            _items = [];
          });
          _load();
        },
      ),
      const SizedBox(height: 10),
      Container(
        decoration: BoxDecoration(color: AppColors.pureWhite, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.border)),
        padding: const EdgeInsets.fromLTRB(12, 10, 12, 4),
        child: _loading
            ? const Padding(padding: EdgeInsets.all(16), child: Center(child: CircularProgressIndicator(strokeWidth: 2)))
            : _error != null
                ? AdminError(message: _error!, onRetry: _load)
                : _items.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(12),
                        child: Text(fr ? 'Rien pour ce filtre.' : 'Nothing for this filter.', style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
                      )
                    : Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                        for (final i in _items) _entry(context, i),
                        if (_next != null)
                          Padding(
                            padding: const EdgeInsets.only(bottom: 8),
                            child: Center(child: AdminButton(fr ? 'Plus ancien' : 'Older entries', primary: false, busy: _more, onPressed: _loadMore)),
                          ),
                      ]),
      ),
    ]);
  }

  Widget _summaryTiles(BuildContext context, Map<String, dynamic> s) {
    final fr = context.isFrench;
    final access = J.map(s['access']), credits = J.map(s['credits']), pack = J.map(s['package']), status = J.map(s['status']);
    final granted = J.map(credits['granted']), revoked = J.map(credits['revoked']);
    final ext = J.i(access['extensions']);
    return AdminGrid(minTileWidth: 150, maxColumns: 4, spacing: 8, children: [
      StatTile(
        label: fr ? 'Accès jusqu’au' : 'Access until',
        value: AdminFmt.dayShort(context, J.date(access['current_end'])),
        sub: ext > 0
            ? (fr ? '$ext prolongation(s) · +${J.i(access['days_added'])} j · initialement ${AdminFmt.dayShort(context, J.date(access['original_end']))}'
                : '$ext extension(s) · +${J.i(access['days_added'])} d · initially ${AdminFmt.dayShort(context, J.date(access['original_end']))}')
            : (fr ? 'Jamais prolongé' : 'Never extended'),
        icon: Icons.event_repeat,
        onTap: () => _pick('access'),
      ),
      StatTile(
        label: fr ? 'Crédits donnés (admin)' : 'Credits given (admin)',
        value: '${J.i(granted['ee'])} EE · ${J.i(granted['eo'])} EO',
        sub: J.i(revoked['ee']) + J.i(revoked['eo']) > 0
            ? (fr ? '${J.i(revoked['ee'])} EE · ${J.i(revoked['eo'])} EO retirés' : '${J.i(revoked['ee'])} EE · ${J.i(revoked['eo'])} EO taken back')
            : (fr ? 'Rien retiré' : 'Nothing taken back'),
        icon: Icons.bolt,
        color: const Color(0xFFB45309),
        onTap: () => _pick('credits'),
      ),
      StatTile(
        label: fr ? 'Forfait' : 'Package',
        value: J.i(pack['original']) == J.i(pack['current']) ? '${J.i(pack['current'])}' : '${J.i(pack['original'])} → ${J.i(pack['current'])}',
        sub: J.i(pack['changes']) > 0 ? (fr ? '${J.i(pack['changes'])} modification(s)' : '${J.i(pack['changes'])} change(s)') : (fr ? 'Inchangé' : 'Unchanged'),
        icon: Icons.groups_outlined,
        onTap: () => _pick('package'),
      ),
      StatTile(
        label: fr ? 'Statut' : 'Status',
        value: status['current'] == 'suspended' ? (fr ? 'Désactivée' : 'Disabled') : (fr ? 'Active' : 'Enabled'),
        sub: J.i(status['suspensions']) > 0
            ? (fr ? 'Désactivée ${J.i(status['suspensions'])} fois' : 'Disabled ${J.i(status['suspensions'])} time(s)')
            : (fr ? 'Jamais désactivée' : 'Never disabled'),
        icon: Icons.shield_outlined,
        color: status['current'] == 'suspended' ? AppColors.bad : AppColors.good,
        onTap: () => _pick('status'),
      ),
    ]);
  }

  void _pick(String category) {
    setState(() {
      _category = _category == category ? 'all' : category;
      _items = [];
    });
    _load();
  }

  Widget _entry(BuildContext context, Map<String, dynamic> item) {
    final fr = context.isFrench;
    final h = describeHistory(context, item);
    final actor = J.map(item['actor']);
    final color = switch (h.tone) { 'up' => AppColors.good, 'down' => AppColors.warn, 'bad' => AppColors.bad, _ => AppColors.textMuted };
    final roles = {'admin': fr ? 'Administrateur' : 'Administrator', 'org_admin': fr ? 'Responsable entreprise' : 'Company manager'};
    final who = actor.isEmpty
        ? (fr ? 'Système (automatique)' : 'System (automatic)')
        : [J.s(actor['name']).isEmpty ? '?' : J.s(actor['name']), roles[J.s(actor['role'])] ?? J.s(actor['role'])].where((x) => x.isNotEmpty).join(' · ');
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          margin: const EdgeInsets.only(top: 3),
          width: 10,
          height: 10,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(h.title, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink)),
            for (final c in h.changes)
              Padding(
                padding: const EdgeInsets.only(top: 4),
                child: Wrap(crossAxisAlignment: WrapCrossAlignment.center, spacing: 6, runSpacing: 2, children: [
                  Text(c.label, style: AppTypography.caption.copyWith(color: AppColors.textMuted)),
                  _chip(c.from, strike: true),
                  const Icon(Icons.arrow_forward, size: 12, color: AppColors.textSubtle),
                  _chip(c.to),
                ]),
              ),
            for (final f in h.facts)
              Padding(padding: const EdgeInsets.only(top: 3), child: Text(f, style: AppTypography.caption.copyWith(color: AppColors.text))),
            if (h.note != null)
              Container(
                margin: const EdgeInsets.only(top: 5),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: const BoxDecoration(
                  color: AppColors.surfaceSoft,
                  border: Border(left: BorderSide(color: AppColors.adminAccentLine, width: 3)),
                ),
                child: Text(h.note!, style: AppTypography.caption.copyWith(color: AppColors.text)),
              ),
            const SizedBox(height: 4),
            Text('${AdminFmt.dateTime(context, J.date(item['created_at']))} · $who',
                style: AppTypography.caption.copyWith(color: AppColors.textSubtle, fontSize: 11)),
          ]),
        ),
      ]),
    );
  }

  Widget _chip(String text, {bool strike = false}) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
        decoration: BoxDecoration(color: strike ? AppColors.surfaceSoft : AppColors.adminAccentBg, borderRadius: BorderRadius.circular(5)),
        child: Text(
          text,
          style: AppTypography.caption.copyWith(
            fontWeight: strike ? FontWeight.w500 : FontWeight.w800,
            color: strike ? AppColors.textMuted : AppColors.ink,
            decoration: strike ? TextDecoration.lineThrough : null,
          ),
        ),
      );
}
