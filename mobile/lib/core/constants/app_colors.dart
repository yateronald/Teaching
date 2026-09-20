import 'package:flutter/material.dart';

/// Design tokens matching the web platform:
/// French Editorial, Teacher Space palette, and semantic status colors.
class AppColors {
  AppColors._();

  // ── French Brand Tokens ──
  static const Color frenchNavy = Color(0xFF14264C);
  static const Color frenchNavyDark = Color(0xFF0E1B38);
  static const Color frenchBlue = Color(0xFF1E40AF);
  static const Color frenchBlueLight = Color(0xFF2563EB);
  static const Color frenchRed = Color(0xFFC8102E);
  static const Color frenchGold = Color(0xFFC9971C);
  static const Color frenchGoldBg = Color(0xFFFEF9C3);
  static const Color frenchPaper = Color(0xFFFBF9F5);
  static const Color pureWhite = Color(0xFFFFFFFF);

  // ── Teacher Space & Sidebar Accent ──
  static const Color teacherDot = Color(0xFF991B1B);
  static const Color teacherRoseBg = Color(0xFFFFF1F2);
  static const Color teacherAccent = Color(0xFF4F46E5);
  static const Color teacherAccentSoft = Color(0xFFEEF2FF);
  static const Color teacherAccentLine = Color(0xFFC7D2FE);

  // ── Slate Ink & Neutrals ──
  static const Color ink = Color(0xFF0F172A);
  static const Color text = Color(0xFF334155);
  static const Color textMuted = Color(0xFF64748B);
  static const Color textSubtle = Color(0xFF94A3B8);
  static const Color border = Color(0xFFE2E8F0);
  static const Color borderSoft = Color(0xFFF1F5F9);
  static const Color surfaceSoft = Color(0xFFF8FAFC);

  // ── Semantic Feedback ──
  static const Color good = Color(0xFF059669);
  static const Color goodBg = Color(0xFFECFDF5);
  static const Color goodBorder = Color(0xFFA7F3D0);

  static const Color warn = Color(0xFFD97706);
  static const Color warnBg = Color(0xFFFFFBEB);
  static const Color warnBorder = Color(0xFFFDE68A);

  static const Color bad = Color(0xFFDC2626);
  static const Color badBg = Color(0xFFFEF2F2);
  static const Color badBorder = Color(0xFFFECACA);

  // ── CEFR Level Colors ──
  static const Color levelA1 = Color(0xFF3B82F6);
  static const Color levelA2 = Color(0xFF06B6D4);
  static const Color levelB1 = Color(0xFF10B981);
  static const Color levelB2 = Color(0xFF8B5CF6);
  static const Color levelC1 = Color(0xFFEC4899);
  static const Color levelC2 = Color(0xFFF59E0B);

  // Helper for performance rating tone
  static Color toneColor(double? score) {
    if (score == null) return textSubtle;
    if (score >= 70) return good;
    if (score >= 50) return warn;
    return bad;
  }
}
