import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../common/admin_kit.dart';

/// Helpers around a demo request (the JSON map the API returns).
class Demo {
  Demo._();

  static const statuses = ['new', 'contacted', 'demo_scheduled', 'completed', 'cancelled'];

  /// The counter of each status in the API statistics.
  static const statKey = {
    'new': 'new_requests',
    'contacted': 'contacted',
    'demo_scheduled': 'demo_scheduled',
    'completed': 'completed',
    'cancelled': 'cancelled',
  };

  static String statusLabel(String s, bool fr) {
    switch (s) {
      case 'new':
        return fr ? 'Nouvelle' : 'New';
      case 'contacted':
        return fr ? 'Contactée' : 'Contacted';
      case 'demo_scheduled':
        return fr ? 'Planifiée' : 'Scheduled';
      case 'completed':
        return fr ? 'Terminée' : 'Completed';
      case 'cancelled':
        return fr ? 'Annulée' : 'Cancelled';
      default:
        return s;
    }
  }

  static Color statusColor(String s) {
    switch (s) {
      case 'new':
        return AppColors.warn;
      case 'contacted':
        return const Color(0xFF2563EB);
      case 'demo_scheduled':
        return const Color(0xFF7C3AED);
      case 'completed':
        return AppColors.good;
      default:
        return AppColors.textMuted;
    }
  }

  static IconData statusIcon(String s) {
    switch (s) {
      case 'new':
        return Icons.fiber_new_outlined;
      case 'contacted':
        return Icons.phone_in_talk_outlined;
      case 'demo_scheduled':
        return Icons.event_available_outlined;
      case 'completed':
        return Icons.check_circle_outline;
      default:
        return Icons.cancel_outlined;
    }
  }

  static String interestLabel(String? i, bool fr) {
    if (i == 'exam') return fr ? 'Examen seulement' : 'Exam only';
    if (i == 'classes') return fr ? 'Cours en direct' : 'Live classes';
    return '';
  }

  static String skillsLabel(String? skills, bool fr) {
    const names = {'ce': 'CE', 'co': 'CO', 'ee': 'EE', 'eo': 'EO'};
    final parts = (skills ?? '').split(',').map((s) => names[s.trim()]).whereType<String>().toList();
    return parts.join(' · ');
  }

  static bool passed(Map<String, dynamic> d) {
    final at = J.date(d['demo_scheduled_at']);
    return at != null && at.isBefore(DateTime.now());
  }

  static bool hadExperience(dynamic v) => v == true || v == 1 || v == '1' || v == 'true' || v == 'yes';
}
