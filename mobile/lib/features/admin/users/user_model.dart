import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../common/admin_kit.dart';

/// An account as the admin user list returns it.
class AdminUser {
  final int id;
  final String username;
  final String email;
  final String firstName;
  final String lastName;
  final String role;
  final DateTime? createdAt;
  final bool isActive;
  final int failedLogins;
  final bool canViewMonitoring;

  /// Company accounts (managers and learners): the company they belong to.
  final int? organizationId;
  final String? organizationName;

  /// Exam candidates only: goal, open content, last practice, devices.
  final Map<String, dynamic>? exam;

  /// Students only: the batches they belong to.
  final List<Map<String, dynamic>> batches;

  const AdminUser({
    required this.id,
    required this.username,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.role,
    required this.createdAt,
    required this.isActive,
    required this.failedLogins,
    required this.canViewMonitoring,
    this.exam,
    this.batches = const [],
    this.organizationId,
    this.organizationName,
  });

  /// Failed sign-ins before an account is flagged (as on the web).
  static const attentionThreshold = 3;
  static const roles = ['student', 'candidate', 'teacher', 'admin'];

  /// Roles shown in the list filters: company managers are created from the
  /// company's page, never from the user form.
  static const listedRoles = [...roles, 'org_admin'];

  factory AdminUser.fromJson(Map<String, dynamic> j) => AdminUser(
        id: J.i(j['id']),
        username: J.s(j['username']),
        email: J.s(j['email']),
        firstName: J.s(j['first_name']),
        lastName: J.s(j['last_name']),
        role: J.s(j['role']).isEmpty ? 'student' : J.s(j['role']),
        createdAt: J.date(j['created_at']),
        isActive: j['is_active'] == null ? true : (j['is_active'] == true || j['is_active'] == 1),
        failedLogins: J.i(j['failed_login_attempts']),
        canViewMonitoring: j['can_view_monitoring'] == true,
        exam: j['exam'] is Map ? Map<String, dynamic>.from(j['exam']) : null,
        batches: J.list(j['batches']),
        organizationId: j['organization_id'] == null ? null : J.i(j['organization_id']),
        organizationName: J.s(j['organization_name']).isEmpty ? null : J.s(j['organization_name']),
      );

  String get fullName {
    final n = '$firstName $lastName'.trim();
    return n.isNotEmpty ? n : (username.isNotEmpty ? username : email);
  }

  bool get isCompanyAccount => organizationId != null;

  bool get needsAttention => failedLogins >= attentionThreshold;
  bool get isNew => createdAt != null && DateTime.now().difference(createdAt!).inDays <= 30;
  Color get roleColor => colorFor(role);

  static Color colorFor(String role) {
    switch (role) {
      case 'admin':
        return const Color(0xFF7C3AED);
      case 'teacher':
        return const Color(0xFF2563EB);
      case 'candidate':
        return const Color(0xFFD97706);
      case 'org_admin':
        return const Color(0xFF0F766E);
      default:
        return AppColors.good;
    }
  }

  static String roleLabel(String role, bool fr) {
    switch (role) {
      case 'admin':
        return fr ? 'Admin' : 'Admin';
      case 'teacher':
        return fr ? 'Professeur' : 'Teacher';
      case 'candidate':
        return fr ? 'Candidat' : 'Candidate';
      case 'org_admin':
        return fr ? 'Responsable entreprise' : 'Company manager';
      default:
        return fr ? 'Étudiant' : 'Student';
    }
  }

  static String rolePlural(String role, bool fr) {
    switch (role) {
      case 'admin':
        return fr ? 'Admins' : 'Admins';
      case 'teacher':
        return fr ? 'Professeurs' : 'Teachers';
      case 'candidate':
        return fr ? 'Candidats' : 'Candidates';
      case 'org_admin':
        return fr ? 'Responsables entreprise' : 'Company managers';
      default:
        return fr ? 'Étudiants' : 'Students';
    }
  }

  static String roleHint(String role, bool fr) {
    switch (role) {
      case 'admin':
        return fr ? 'Accès complet à la console.' : 'Full access to the admin console.';
      case 'teacher':
        return fr ? 'Promotions, cours en direct, corrections.' : 'Batches, live classes and grading.';
      case 'candidate':
        return fr ? "Entraînement à l'examen seulement." : 'Exam practice only, no classes.';
      case 'org_admin':
        return fr ? 'Gère les apprenants de son entreprise.' : 'Manages the learners of their company.';
      default:
        return fr ? 'Cours, quiz et entraînement.' : 'Classes, quizzes and exam practice.';
    }
  }

  static IconData roleIcon(String role) {
    switch (role) {
      case 'admin':
        return Icons.workspace_premium_outlined;
      case 'teacher':
        return Icons.co_present_outlined;
      case 'candidate':
        return Icons.track_changes_outlined;
      case 'org_admin':
        return Icons.apartment_outlined;
      default:
        return Icons.menu_book_outlined;
    }
  }

  /// Exams a candidate can aim for, with their display names.
  static const examTargets = {
    'tcf_canada': 'TCF Canada',
    'tcf_quebec': 'TCF Québec',
    'tcf_tp': 'TCF Tout public',
  };

  /// A username built from the name (as the web suggests it).
  static String suggestUsername(String first, String last, String email) {
    String slug(String s) {
      const from = 'àâäáãåçèéêëìíîïñòóôöõùúûüýÿœæ';
      const to = 'aaaaaaceeeeiiiinooooouuuuyyoa';
      final lower = s.toLowerCase();
      final buf = StringBuffer();
      for (final ch in lower.split('')) {
        final i = from.indexOf(ch);
        buf.write(i >= 0 ? to[i] : ch);
      }
      return buf.toString().replaceAll(RegExp(r'[^a-z0-9]+'), '.').replaceAll(RegExp(r'^\.+|\.+$'), '');
    }

    final joined = [slug(first), slug(last)].where((p) => p.isNotEmpty).join('.');
    return joined.isNotEmpty ? joined : slug(email.split('@').first);
  }
}
