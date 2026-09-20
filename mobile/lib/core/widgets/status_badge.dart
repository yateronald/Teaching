import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';

enum BadgeTone { primary, good, warn, bad, neutral, level }

class StatusBadge extends StatelessWidget {
  final String label;
  final BadgeTone tone;
  final IconData? icon;

  const StatusBadge({
    super.key,
    required this.label,
    this.tone = BadgeTone.neutral,
    this.icon,
  });

  factory StatusBadge.liveState(String state) {
    switch (state.toLowerCase()) {
      case 'live':
      case 'active':
        return StatusBadge(label: 'Live now', tone: BadgeTone.good, icon: Icons.fiber_manual_record);
      case 'scheduled':
      case 'soon':
        return StatusBadge(label: 'Scheduled', tone: BadgeTone.primary, icon: Icons.schedule);
      case 'completed':
      case 'published':
        return StatusBadge(label: state[0].toUpperCase() + state.substring(1), tone: BadgeTone.good);
      case 'draft':
        return StatusBadge(label: 'Draft', tone: BadgeTone.neutral);
      case 'ended':
      case 'cancelled':
        return StatusBadge(label: state[0].toUpperCase() + state.substring(1), tone: BadgeTone.bad);
      default:
        return StatusBadge(label: state, tone: BadgeTone.neutral);
    }
  }

  factory StatusBadge.cefr(String level) {
    return StatusBadge(
      label: level.toUpperCase(),
      tone: BadgeTone.level,
    );
  }

  factory StatusBadge.score(double pct) {
    final tone = pct >= 70
        ? BadgeTone.good
        : pct >= 50
            ? BadgeTone.warn
            : BadgeTone.bad;
    return StatusBadge(
      label: '${pct.toStringAsFixed(0)}%',
      tone: tone,
    );
  }

  Color get _bg {
    switch (tone) {
      case BadgeTone.primary:
        return AppColors.teacherAccentSoft;
      case BadgeTone.good:
        return AppColors.goodBg;
      case BadgeTone.warn:
        return AppColors.warnBg;
      case BadgeTone.bad:
        return AppColors.badBg;
      case BadgeTone.level:
        return const Color(0xFFEFF6FF);
      case BadgeTone.neutral:
        return AppColors.surfaceSoft;
    }
  }

  Color get _text {
    switch (tone) {
      case BadgeTone.primary:
        return AppColors.teacherAccent;
      case BadgeTone.good:
        return AppColors.good;
      case BadgeTone.warn:
        return AppColors.warn;
      case BadgeTone.bad:
        return AppColors.bad;
      case BadgeTone.level:
        return AppColors.frenchBlue;
      case BadgeTone.neutral:
        return AppColors.text;
    }
  }

  Color get _border {
    switch (tone) {
      case BadgeTone.primary:
        return AppColors.teacherAccentLine;
      case BadgeTone.good:
        return AppColors.goodBorder;
      case BadgeTone.warn:
        return AppColors.warnBorder;
      case BadgeTone.bad:
        return AppColors.badBorder;
      case BadgeTone.level:
        return const Color(0xFFBFDBFE);
      case BadgeTone.neutral:
        return AppColors.border;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
      decoration: BoxDecoration(
        color: _bg,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: _border, width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 11, color: _text),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: AppTypography.labelSmall.copyWith(
              color: _text,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}
