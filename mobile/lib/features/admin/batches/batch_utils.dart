import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../common/admin_kit.dart';

/// Shared helpers for the admin batch screens (same rules as the web).
class BatchX {
  BatchX._();

  static const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  static String levelHint(String level, bool fr) {
    switch (level) {
      case 'A1':
        return fr ? 'Débutant' : 'Beginner';
      case 'A2':
        return fr ? 'Élémentaire' : 'Elementary';
      case 'B1':
        return fr ? 'Intermédiaire' : 'Intermediate';
      case 'B2':
        return fr ? 'Intermédiaire avancé' : 'Upper-intermediate';
      case 'C1':
        return fr ? 'Avancé' : 'Advanced';
      default:
        return fr ? 'Maîtrise' : 'Mastery';
    }
  }

  /// Monday first for display; the values keep the server convention (0 = Sunday).
  static const week = [1, 2, 3, 4, 5, 6, 0];

  static String dayShort(int d, bool fr) =>
      (fr ? const ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'] : const ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])[d % 7];

  static String dayLong(int d, bool fr) => (fr
      ? const ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
      : const ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])[d % 7];

  static int weekOrder(int d) => d == 0 ? 7 : d;

  static String status(Map<String, dynamic> b) {
    final now = DateTime.now();
    final s = J.date(b['start_date']);
    final e = J.date(b['end_date']);
    if (s != null && now.isBefore(s)) return 'upcoming';
    if (e != null && now.isAfter(e)) return 'ended';
    return 'running';
  }

  static String statusLabel(String s, bool fr) {
    switch (s) {
      case 'upcoming':
        return fr ? 'À venir' : 'Upcoming';
      case 'ended':
        return fr ? 'Terminée' : 'Ended';
      default:
        return fr ? 'En cours' : 'Running';
    }
  }

  static Color statusColor(String s) {
    switch (s) {
      case 'upcoming':
        return const Color(0xFF0891B2);
      case 'ended':
        return AppColors.textMuted;
      default:
        return const Color(0xFF4F46E5);
    }
  }

  /// Share of the batch period already elapsed (0–1).
  static double progress(Map<String, dynamic> b) {
    final s = J.date(b['start_date']);
    final e = J.date(b['end_date']);
    if (s == null || e == null || !e.isAfter(s)) return 0;
    final p = DateTime.now().difference(s).inSeconds / e.difference(s).inSeconds;
    return p.clamp(0, 1).toDouble();
  }

  static String teacher(Map<String, dynamic> b) {
    final n = J.name(b, first: 'teacher_first_name', last: 'teacher_last_name');
    return n;
  }

  static int students(Map<String, dynamic> b) {
    if (b['students'] is List) return (b['students'] as List).length;
    return J.i(b['student_count']);
  }

  static String duration(Map<String, dynamic> b, bool fr) {
    final s = J.date(b['start_date']);
    final e = J.date(b['end_date']);
    if (s == null || e == null) return '—';
    final d = e.difference(s).inDays;
    if (d < 0) return '—';
    if (d < 14) return fr ? '$d jour${d > 1 ? 's' : ''}' : '$d day${d == 1 ? '' : 's'}';
    if (d < 70) return fr ? '${(d / 7).round()} semaines' : '${(d / 7).round()} weeks';
    return fr ? '${(d / 30).round()} mois' : '${(d / 30).round()} months';
  }

  static String hhmm(dynamic t) {
    final s = J.s(t);
    return s.length >= 5 ? s.substring(0, 5) : s;
  }

  static int minutes(String t) {
    final parts = hhmm(t).split(':');
    if (parts.length < 2) return 0;
    return (int.tryParse(parts[0]) ?? 0) * 60 + (int.tryParse(parts[1]) ?? 0);
  }

  static String hoursText(int mins) {
    if (mins <= 0) return '0 h';
    final h = mins ~/ 60;
    final m = mins % 60;
    return h > 0 ? '$h h${m > 0 ? ' $m min' : ''}' : '$m min';
  }

  /// Common timezones, first the ones the school works with.
  static const timezones = [
    'Europe/Paris', 'America/Toronto', 'America/Montreal', 'America/Vancouver', 'America/Edmonton', 'America/Winnipeg',
    'America/Halifax', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles', 'America/Sao_Paulo',
    'UTC', 'Europe/London', 'Europe/Brussels', 'Europe/Zurich', 'Europe/Berlin', 'Europe/Madrid', 'Europe/Rome',
    'Africa/Abidjan', 'Africa/Casablanca', 'Africa/Algiers', 'Africa/Tunis', 'Africa/Dakar', 'Africa/Lagos', 'Africa/Douala',
    'Africa/Kinshasa', 'Africa/Nairobi', 'Africa/Cairo', 'Africa/Johannesburg', 'Asia/Dubai', 'Asia/Riyadh', 'Asia/Karachi',
    'Asia/Kolkata', 'Asia/Dhaka', 'Asia/Bangkok', 'Asia/Singapore', 'Asia/Manila', 'Asia/Shanghai', 'Asia/Tokyo',
    'Asia/Seoul', 'Australia/Perth', 'Australia/Sydney', 'Pacific/Auckland',
  ];
}
