import 'package:flutter/material.dart';
import '../../../core/api/api_endpoints.dart';
import '../../../core/constants/app_colors.dart';
import '../common/admin_kit.dart';

/// A company (organization) as the admin API describes it
/// (GET /admin/organizations and /admin/organizations/:id).
class Company {
  final int id;
  final String name;
  final String? displayName;
  final String slug;
  final String language;
  final String status; // active | suspended
  final String state; // active | expired | not_started | suspended
  final DateTime? startsAt;
  final DateTime? endsAt;
  final int daysLeft;
  final bool expiringSoon;

  /// The package: learner accounts the company may create (active or not all count).
  final int seatLimit;
  final int seatsUsed;
  final int seatsLeft;
  final int activeLearners;
  final int learners;
  final int managers;
  final String? notes;
  final String? logoUrl;
  final CreditPot ee;
  final CreditPot eo;

  /// Detail only.
  final List<Map<String, dynamic>> content;
  final List<Map<String, dynamic>> managerList;

  const Company({
    required this.id,
    required this.name,
    required this.displayName,
    required this.slug,
    required this.language,
    required this.status,
    required this.state,
    required this.startsAt,
    required this.endsAt,
    required this.daysLeft,
    required this.expiringSoon,
    required this.seatLimit,
    required this.seatsUsed,
    required this.seatsLeft,
    required this.activeLearners,
    required this.learners,
    required this.managers,
    required this.notes,
    required this.logoUrl,
    required this.ee,
    required this.eo,
    this.content = const [],
    this.managerList = const [],
  });

  factory Company.fromJson(Map<String, dynamic> j) {
    final brand = J.map(j['brand']);
    final credits = J.map(j['credits']);
    return Company(
      id: J.i(j['id']),
      name: J.s(j['name']),
      displayName: J.s(j['display_name']).isEmpty ? null : J.s(j['display_name']),
      slug: J.s(j['slug']),
      language: J.s(j['default_language']).isEmpty ? 'fr' : J.s(j['default_language']),
      status: J.s(j['status']),
      state: J.s(j['state']),
      startsAt: J.date(j['access_starts_at']),
      endsAt: J.date(j['access_ends_at']),
      daysLeft: J.i(j['days_left']),
      expiringSoon: j['expiring_soon'] == true,
      seatLimit: J.i(j['seat_limit']),
      seatsUsed: J.i(j['seats_used']),
      seatsLeft: J.i(j['seats_left']),
      activeLearners: J.i(j['active_learners']),
      learners: J.i(j['learners']),
      // The detail replaces the count by the list of managers.
      managers: j['managers'] is List ? J.list(j['managers']).where((m) => m['is_active'] == true).length : J.i(j['managers']),
      notes: J.s(j['notes']).isEmpty ? null : J.s(j['notes']),
      logoUrl: J.s(brand['logo_url']).isEmpty ? null : J.s(brand['logo_url']),
      ee: CreditPot.fromJson(J.map(credits['ee'])),
      eo: CreditPot.fromJson(J.map(credits['eo'])),
      content: J.list(j['content']),
      managerList: J.list(j['managers'] is List ? j['managers'] : null),
    );
  }

  /// The name learners see.
  String get shownName => displayName ?? name;

  /// The logo as a full address on the API host (the API returns "/api/public/org/…").
  String? get logoAddress {
    if (logoUrl == null) return null;
    final host = ApiEndpoints.baseUrl.replaceFirst(RegExp(r'/api/?$'), '');
    return logoUrl!.startsWith('http') ? logoUrl : '$host$logoUrl';
  }

  /// The company's own sign-in page.
  String get signInAddress => 'https://learnfrenchwithnatives.com/o/$slug';

  bool get isOpen => state == 'active';
  bool get isSuspended => status == 'suspended';

  String stateLabel(bool fr) {
    switch (state) {
      case 'suspended':
        return fr ? 'Désactivée' : 'Disabled';
      case 'expired':
        return fr ? 'Expirée' : 'Expired';
      case 'not_started':
        return fr ? 'Pas commencée' : 'Not started';
      default:
        return expiringSoon
            ? (fr ? 'Se termine dans $daysLeft j' : 'Ends in $daysLeft d')
            : (fr ? 'Active' : 'Active');
    }
  }

  Color get stateColor {
    switch (state) {
      case 'suspended':
        return AppColors.bad;
      case 'expired':
        return AppColors.textMuted;
      case 'not_started':
        return const Color(0xFF2563EB);
      default:
        return expiringSoon ? AppColors.warn : AppColors.good;
    }
  }
}

/// A company's credits of one kind: reserve, handed to learners, used, granted.
class CreditPot {
  final int reserve;
  final int withLearners;
  final int used;
  final int granted;
  const CreditPot({required this.reserve, required this.withLearners, required this.used, required this.granted});
  factory CreditPot.fromJson(Map<String, dynamic> j) => CreditPot(
        reserve: J.i(j['reserve']),
        withLearners: J.i(j['with_learners']),
        used: J.i(j['used']),
        granted: J.i(j['granted']),
      );
}

/// Skill family of a piece of content, for its chip colour and code.
({String code, Color color}) familyOf(Map<String, dynamic> c) {
  final type = J.s(c['content_type']);
  String p = type.length >= 2 ? type.substring(0, 2) : '';
  if (type == 'category') {
    final n = J.s(c['name']).toLowerCase();
    p = n.contains('écrite') || n.contains('ecrite')
        ? (n.startsWith('compr') ? 'ce' : 'ee')
        : n.contains('orale')
            ? (n.startsWith('compr') ? 'co' : 'eo')
            : '';
  }
  switch (p) {
    case 'ce':
      return (code: 'CE', color: const Color(0xFF2563EB));
    case 'co':
      return (code: 'CO', color: const Color(0xFF7C3AED));
    case 'ee':
      return (code: 'EE', color: const Color(0xFFB45309));
    case 'eo':
      return (code: 'EO', color: const Color(0xFFBE123C));
    default:
      return (code: 'TCF', color: AppColors.textMuted);
  }
}

/// "3 EE + 2 EO" from {ee: 3, eo: 2} (kinds at 0 are left out).
String kindsText(Map<String, dynamic> amounts, [String joiner = ' + ']) =>
    [for (final t in const ['ee', 'eo']) if (J.i(amounts[t]) > 0) '${J.i(amounts[t])} ${t.toUpperCase()}'].join(joiner);

/// One movement of a company's credits, in words.
String creditMoveText(Map<String, dynamic> m, bool fr) {
  final who = J.name(m, first: 'learner_first_name', last: 'learner_last_name');
  switch (J.s(m['reason'])) {
    case 'admin_grant':
      return fr ? 'Ajoutés par l’administrateur' : 'Added by the administrator';
    case 'admin_revoke':
      return fr ? 'Retirés par l’administrateur' : 'Taken back by the administrator';
    case 'distribute':
      return fr ? 'Donnés à $who' : 'Given to $who';
    case 'reclaim':
      return fr ? 'Récupérés de $who' : 'Taken back from $who';
    case 'learner_left':
      return fr ? 'Rendus à la désactivation de $who' : 'Returned when $who was deactivated';
    default:
      return J.s(m['reason']);
  }
}

/// One line of the company's activity log, in words.
String auditLineText(Map<String, dynamic> a, bool fr) {
  final d = J.map(a['details']);
  switch (J.s(a['action'])) {
    case 'company_created':
      return fr ? 'Entreprise créée' : 'Company created';
    case 'company_updated':
      return fr ? 'Informations modifiées' : 'Details changed';
    case 'dates_changed':
      return fr ? 'Dates d’accès modifiées' : 'Access dates changed';
    case 'company_suspended':
      return fr ? 'Entreprise désactivée' : 'Company disabled';
    case 'company_reactivated':
      return fr ? 'Entreprise réactivée' : 'Company reactivated';
    case 'content_changed':
      return fr ? 'Examens autorisés modifiés' : 'Allowed exams changed';
    case 'credits_granted':
      final a = d['amounts'] is Map ? kindsText(J.map(d['amounts'])) : '${d['amount']}';
      return fr ? '$a crédits ajoutés' : '$a credits added';
    case 'credits_revoked':
      final a = d['amounts'] is Map ? kindsText(J.map(d['amounts'])) : '${d['amount']}';
      return fr ? '$a crédits retirés' : '$a credits taken back';
    case 'credits_distributed':
      final a = d['amounts'] is Map ? kindsText(J.map(d['amounts'])) : '${d['each']}';
      return fr ? '$a crédit(s) chacun à ${d['learners']} apprenant(s)' : '$a credit(s) each to ${d['learners']} learner(s)';
    case 'credits_reclaimed':
      final a = d['returned'] is Map ? kindsText(J.map(d['returned'])) : '${d['returned']}';
      return fr ? '${a.isEmpty ? '0' : a} crédit(s) récupéré(s)' : '${a.isEmpty ? '0' : a} credit(s) taken back';
    case 'manager_added':
      return fr ? 'Responsable ajouté : ${d['email']}' : 'Manager added: ${d['email']}';
    case 'learner_added':
      return fr ? 'Apprenant ajouté : ${d['email']}' : 'Learner added: ${d['email']}';
    case 'account_deactivated':
      return fr ? 'Compte désactivé' : 'Account deactivated';
    case 'account_reactivated':
      return fr ? 'Compte réactivé' : 'Account reactivated';
    case 'invitation_resent':
      return fr ? 'Invitation renvoyée' : 'Invitation sent again';
    case 'group_created':
      return fr ? 'Groupe créé : ${d['name']}' : 'Group created: ${d['name']}';
    case 'group_deleted':
      return fr ? 'Groupe supprimé : ${d['name']}' : 'Group deleted: ${d['name']}';
    case 'assigned':
      return fr ? 'Attribution « ${d['name']} »' : 'Assigned “${d['name']}”';
    case 'assignment_removed':
      return fr ? 'Attribution supprimée' : 'Assignment removed';
    case 'logo_changed':
      return fr ? 'Logo modifié' : 'Logo changed';
    case 'logo_removed':
      return fr ? 'Logo supprimé' : 'Logo removed';
    case 'settings_changed':
      return fr ? 'Paramètres modifiés' : 'Settings changed';
    case 'expiry_notice_sent':
      return fr ? 'Avertissement d’expiration envoyé' : 'Expiry warning sent';
    default:
      return J.s(a['action']);
  }
}

/// 23:59:59 on the day of [d] (access ends at the end of the chosen day).
DateTime endOfDay(DateTime d) => DateTime(d.year, d.month, d.day, 23, 59, 59);

/// [d] moved by [months], on the last day of the month when it is shorter.
DateTime addMonths(DateTime d, int months) {
  final first = DateTime(d.year, d.month + months, 1);
  final last = DateTime(first.year, first.month + 1, 0).day;
  return DateTime(first.year, first.month, d.day > last ? last : d.day, d.hour, d.minute, d.second);
}
