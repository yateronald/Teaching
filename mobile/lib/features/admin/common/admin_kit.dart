import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../../core/api/api_error.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../../../core/responsive/responsive_layout.dart';

// ════════════════════════════════════════════════════════════════════════
// Building blocks shared by every admin screen, so they look and behave
// alike on a small phone, a large phone and a tablet.
// ════════════════════════════════════════════════════════════════════════

/// Reads the loosely typed JSON the API returns.
class J {
  J._();

  /// A list from `[...]`, `{data: [...]}`, `{batches: [...]}`…
  static List<Map<String, dynamic>> list(dynamic data, [List<String> keys = const []]) {
    dynamic raw = data;
    if (raw is Map) {
      for (final k in [...keys, 'data', 'items', 'results']) {
        if (raw[k] is List) {
          raw = raw[k];
          break;
        }
      }
    }
    if (raw is! List) return [];
    return raw.whereType<Map>().map((e) => Map<String, dynamic>.from(e)).toList();
  }

  static Map<String, dynamic> map(dynamic data) =>
      data is Map ? Map<String, dynamic>.from(data) : <String, dynamic>{};

  static num n(dynamic v) {
    if (v is num) return v;
    return num.tryParse('${v ?? ''}') ?? 0;
  }

  static int i(dynamic v) => n(v).round();

  static String s(dynamic v) => v == null ? '' : '$v';

  static DateTime? date(dynamic v) {
    if (v == null) return null;
    final text = '$v';
    if (text.isEmpty) return null;
    return DateTime.tryParse(text.contains('T') || text.length <= 10 ? text : text.replaceFirst(' ', 'T'))
        ?.toLocal();
  }

  static String name(Map<String, dynamic>? p, {String first = 'first_name', String last = 'last_name'}) =>
      '${p?[first] ?? ''} ${p?[last] ?? ''}'.trim();

  static String initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+')).where((p) => p.isNotEmpty).toList();
    if (parts.isEmpty) return '?';
    final a = parts.first[0];
    final b = parts.length > 1 ? parts.last[0] : (parts.first.length > 1 ? parts.first[1] : '');
    return (a + b).toUpperCase();
  }
}

/// Dates and numbers in the language of the interface.
class AdminFmt {
  AdminFmt._();

  static String _l(BuildContext c) => c.isFrench ? 'fr_FR' : 'en_US';

  static String day(BuildContext c, DateTime? d) =>
      d == null ? '—' : DateFormat('d MMM yyyy', _l(c)).format(d);

  static String dayShort(BuildContext c, DateTime? d) =>
      d == null ? '—' : DateFormat('d MMM', _l(c)).format(d);

  static String weekdayDay(BuildContext c, DateTime? d) =>
      d == null ? '—' : DateFormat('EEE d MMM', _l(c)).format(d);

  static String time(BuildContext c, DateTime? d) =>
      d == null ? '—' : DateFormat(c.isFrench ? 'HH:mm' : 'h:mm a', _l(c)).format(d);

  static String dateTime(BuildContext c, DateTime? d) =>
      d == null ? '—' : '${day(c, d)} · ${time(c, d)}';

  static String number(BuildContext c, num v) => NumberFormat.decimalPattern(_l(c)).format(v);

  static String percent(num? v) => v == null ? '—' : '${v.round()}%';

  /// "3 days ago", "in 2 hours"…
  static String relative(BuildContext c, DateTime? d) {
    if (d == null) return '—';
    final fr = c.isFrench;
    final diff = DateTime.now().difference(d);
    final future = diff.isNegative;
    final a = diff.abs();
    String unit(int v, String en, String frU) => fr ? '$v $frU${v > 1 && !frU.endsWith('s') ? 's' : ''}' : '$v $en${v > 1 ? 's' : ''}';
    String span;
    if (a.inMinutes < 1) return fr ? "à l'instant" : 'just now';
    if (a.inMinutes < 60) {
      span = unit(a.inMinutes, 'minute', 'minute');
    } else if (a.inHours < 24) {
      span = unit(a.inHours, 'hour', 'heure');
    } else if (a.inDays < 30) {
      span = unit(a.inDays, 'day', 'jour');
    } else if (a.inDays < 365) {
      span = unit((a.inDays / 30).floor(), 'month', 'mois');
    } else {
      span = unit((a.inDays / 365).floor(), 'year', 'an');
    }
    if (future) return fr ? 'dans $span' : 'in $span';
    return fr ? 'il y a $span' : '$span ago';
  }
}

/// Page frame: pull to refresh, comfortable margins, content centred on
/// tablets, and an optional sticky toolbar (search and filters).
class AdminPage extends StatelessWidget {
  final Future<void> Function() onRefresh;
  final List<Widget> children;
  final Widget? toolbar;
  final double maxWidth;

  const AdminPage({
    super.key,
    required this.onRefresh,
    required this.children,
    this.toolbar,
    this.maxWidth = ResponsiveLayout.maxContentWidth,
  });

  @override
  Widget build(BuildContext context) {
    final insets = ResponsiveLayout.pageInsets(context);
    final list = RefreshIndicator(
      color: AppColors.adminAccent,
      onRefresh: onRefresh,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: insets.copyWith(bottom: insets.bottom + 24),
        children: [
          for (final child in children) AdaptiveContent(maxWidth: maxWidth, child: child),
        ],
      ),
    );
    if (toolbar == null) return list;
    return Column(
      children: [
        Material(
          color: AppColors.pureWhite,
          elevation: 0,
          child: Container(
            decoration: const BoxDecoration(
              border: Border(bottom: BorderSide(color: AppColors.borderSoft)),
            ),
            padding: EdgeInsets.fromLTRB(insets.left, 12, insets.right, 12),
            child: AdaptiveContent(maxWidth: maxWidth, child: toolbar!),
          ),
        ),
        Expanded(child: list),
      ],
    );
  }
}

/// Title block at the top of a screen, with its main actions.
class AdminHeader extends StatelessWidget {
  final String? overline;
  final String title;
  final String? subtitle;
  final List<Widget> actions;

  const AdminHeader({super.key, this.overline, required this.title, this.subtitle, this.actions = const []});

  @override
  Widget build(BuildContext context) {
    final narrow = MediaQuery.sizeOf(context).width < 560;
    final text = Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (overline != null)
          Text(
            overline!.toUpperCase(),
            style: AppTypography.caption.copyWith(
              color: AppColors.adminAccent,
              fontWeight: FontWeight.w800,
              letterSpacing: 1,
              fontSize: 11,
            ),
          ),
        if (overline != null) const SizedBox(height: 4),
        Text(title, style: AppTypography.headlineSmall.copyWith(color: AppColors.ink, fontWeight: FontWeight.w800)),
        if (subtitle != null) ...[
          const SizedBox(height: 4),
          Text(subtitle!, style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted, height: 1.4)),
        ],
      ],
    );
    if (actions.isEmpty) return Padding(padding: const EdgeInsets.only(bottom: 18), child: text);
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: narrow
          ? Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [text, const SizedBox(height: 12), Wrap(spacing: 8, runSpacing: 8, children: actions)],
            )
          : Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(child: text),
                const SizedBox(width: 12),
                Wrap(spacing: 8, runSpacing: 8, children: actions),
              ],
            ),
    );
  }
}

/// A white card with a title bar: the unit every admin screen is built from.
class AdminCard extends StatelessWidget {
  final String? title;
  final IconData? icon;
  final Widget? action;
  final Widget child;
  final EdgeInsetsGeometry padding;
  final Color? accent;

  const AdminCard({
    super.key,
    this.title,
    this.icon,
    this.action,
    required this.child,
    this.padding = const EdgeInsets.all(16),
    this.accent,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.025), blurRadius: 10, offset: const Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          if (title != null)
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 12, 0),
              child: Row(
                children: [
                  if (icon != null) ...[
                    Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: (accent ?? AppColors.adminAccent).withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(icon, size: 16, color: accent ?? AppColors.adminAccent),
                    ),
                    const SizedBox(width: 10),
                  ],
                  Expanded(
                    child: Text(
                      title!,
                      style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  ?action,
                ],
              ),
            ),
          Padding(padding: padding, child: child),
        ],
      ),
    );
  }
}

/// A small text button for card headers ("See all →").
class AdminLink extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const AdminLink(this.label, {super.key, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return TextButton(
      onPressed: onTap,
      style: TextButton.styleFrom(
        foregroundColor: AppColors.adminAccent,
        padding: const EdgeInsets.symmetric(horizontal: 8),
        minimumSize: const Size(0, 36),
        textStyle: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, fontSize: 12.5),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [Text(label), const SizedBox(width: 4), const Icon(Icons.arrow_forward, size: 14)]),
    );
  }
}

/// Lays tiles in as many columns as fit (1 on a small phone, up to [maxColumns]).
class AdminGrid extends StatelessWidget {
  final List<Widget> children;
  final double minTileWidth;
  final int maxColumns;
  final double spacing;

  const AdminGrid({
    super.key,
    required this.children,
    this.minTileWidth = 280,
    this.maxColumns = 3,
    this.spacing = 14,
  });

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(builder: (context, c) {
      final cols = ((c.maxWidth + spacing) / (minTileWidth + spacing)).floor().clamp(1, maxColumns);
      final width = (c.maxWidth - spacing * (cols - 1)) / cols;
      return Wrap(
        spacing: spacing,
        runSpacing: spacing,
        children: [for (final child in children) SizedBox(width: width, child: child)],
      );
    });
  }
}

/// Search field used in every list toolbar.
class AdminSearchField extends StatelessWidget {
  final String hint;
  final ValueChanged<String> onChanged;
  final TextEditingController? controller;

  const AdminSearchField({super.key, required this.hint, required this.onChanged, this.controller});

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: controller,
      onChanged: onChanged,
      textInputAction: TextInputAction.search,
      style: AppTypography.bodyMedium,
      decoration: InputDecoration(
        isDense: true,
        hintText: hint,
        prefixIcon: const Icon(Icons.search, size: 20, color: AppColors.textMuted),
        filled: true,
        fillColor: AppColors.surfaceSoft,
        contentPadding: const EdgeInsets.symmetric(vertical: 12, horizontal: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.adminAccent, width: 1.5),
        ),
      ),
    );
  }
}

/// One option of a filter row.
class FilterOption<T> {
  final T value;
  final String label;
  final int? count;
  const FilterOption(this.value, this.label, {this.count});
}

/// Horizontally scrolling choice chips (status, role, level…).
class AdminFilterChips<T> extends StatelessWidget {
  final List<FilterOption<T>> options;
  final T selected;
  final ValueChanged<T> onSelected;

  const AdminFilterChips({super.key, required this.options, required this.selected, required this.onSelected});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          for (final o in options)
            Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text(o.count == null ? o.label : '${o.label}  ${o.count}'),
                selected: o.value == selected,
                onSelected: (_) => onSelected(o.value),
                showCheckmark: false,
                labelStyle: AppTypography.caption.copyWith(
                  fontWeight: FontWeight.w700,
                  fontSize: 12.5,
                  color: o.value == selected ? AppColors.pureWhite : AppColors.text,
                ),
                selectedColor: AppColors.adminAccent,
                backgroundColor: AppColors.pureWhite,
                side: BorderSide(color: o.value == selected ? AppColors.adminAccent : AppColors.border),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                visualDensity: VisualDensity.compact,
              ),
            ),
        ],
      ),
    );
  }
}

/// Coloured pill for statuses and levels.
class Pill extends StatelessWidget {
  final String label;
  final Color color;
  final IconData? icon;
  final bool solid;

  const Pill(this.label, {super.key, required this.color, this.icon, this.solid = false});

  static Color levelColor(String? level) {
    switch ((level ?? '').toUpperCase()) {
      case 'A1':
        return AppColors.levelA1;
      case 'A2':
        return AppColors.levelA2;
      case 'B1':
        return AppColors.levelB1;
      case 'B2':
        return AppColors.levelB2;
      case 'C1':
        return AppColors.levelC1;
      case 'C2':
        return AppColors.levelC2;
      default:
        return AppColors.textMuted;
    }
  }

  factory Pill.level(String? level) => Pill((level ?? '—').toUpperCase(), color: levelColor(level), solid: true);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: solid ? color : color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: solid ? null : Border.all(color: color.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[Icon(icon, size: 11, color: solid ? AppColors.pureWhite : color), const SizedBox(width: 4)],
          Text(
            label,
            style: AppTypography.caption.copyWith(
              color: solid ? AppColors.pureWhite : color,
              fontWeight: FontWeight.w800,
              fontSize: 11,
              height: 1.2,
            ),
          ),
        ],
      ),
    );
  }
}

/// Round avatar with initials.
class InitialsAvatar extends StatelessWidget {
  final String name;
  final double size;
  final Color? color;
  const InitialsAvatar(this.name, {super.key, this.size = 38, this.color});

  static const _palette = [
    Color(0xFF4F46E5), Color(0xFF0891B2), Color(0xFF059669), Color(0xFFD97706),
    Color(0xFFDB2777), Color(0xFF7C3AED), Color(0xFF2563EB), Color(0xFF0D9488),
  ];

  @override
  Widget build(BuildContext context) {
    final c = color ?? _palette[name.hashCode.abs() % _palette.length];
    return Container(
      width: size,
      height: size,
      alignment: Alignment.center,
      decoration: BoxDecoration(color: c.withValues(alpha: 0.12), shape: BoxShape.circle),
      child: Text(
        J.initials(name),
        style: AppTypography.caption.copyWith(color: c, fontWeight: FontWeight.w800, fontSize: size * 0.34),
      ),
    );
  }
}

/// Label / value line in detail panels.
class InfoRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Widget? trailing;
  const InfoRow({super.key, required this.icon, required this.label, required this.value, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 17, color: AppColors.textSubtle),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                SelectableText(value.isEmpty ? '—' : value, style: AppTypography.bodyMedium.copyWith(color: AppColors.ink)),
              ],
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

/// Key figure tile (dashboard, reports).
class StatTile extends StatelessWidget {
  final String label;
  final String value;
  final String? sub;
  final IconData icon;
  final Color color;
  final VoidCallback? onTap;

  const StatTile({
    super.key,
    required this.label,
    required this.value,
    this.sub,
    required this.icon,
    this.color = AppColors.adminAccent,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
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
            border: Border.all(color: AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(7),
                    decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(9)),
                    child: Icon(icon, size: 18, color: color),
                  ),
                  const Spacer(),
                  if (onTap != null) const Icon(Icons.arrow_forward, size: 15, color: AppColors.textSubtle),
                ],
              ),
              const SizedBox(height: 12),
              Text(label, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w600)),
              const SizedBox(height: 2),
              FittedBox(
                fit: BoxFit.scaleDown,
                alignment: Alignment.centerLeft,
                child: Text(
                  value,
                  style: AppTypography.headlineMedium.copyWith(color: AppColors.ink, fontWeight: FontWeight.w800),
                ),
              ),
              if (sub != null) ...[
                const SizedBox(height: 2),
                Text(
                  sub!,
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

/// Loading placeholder for a screen.
class AdminLoading extends StatelessWidget {
  const AdminLoading({super.key});
  @override
  Widget build(BuildContext context) => const Center(
        child: Padding(
          padding: EdgeInsets.all(40),
          child: CircularProgressIndicator(strokeWidth: 2.5, color: AppColors.adminAccent),
        ),
      );
}

/// Error block with a retry button.
class AdminError extends StatelessWidget {
  final String message;
  final VoidCallback onRetry;
  const AdminError({super.key, required this.message, required this.onRetry});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.cloud_off_outlined, size: 40, color: AppColors.textSubtle),
            const SizedBox(height: 12),
            Text(message, textAlign: TextAlign.center, style: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted)),
            const SizedBox(height: 14),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh, size: 18),
              label: Text(context.isFrench ? 'Réessayer' : 'Try again'),
            ),
          ],
        ),
      ),
    );
  }
}

/// Empty list message.
class AdminEmpty extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? message;
  const AdminEmpty({super.key, required this.icon, required this.title, this.message});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 36, horizontal: 16),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(14),
            decoration: const BoxDecoration(color: AppColors.adminAccentBg, shape: BoxShape.circle),
            child: Icon(icon, size: 28, color: AppColors.adminAccent),
          ),
          const SizedBox(height: 12),
          Text(title, textAlign: TextAlign.center, style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700)),
          if (message != null) ...[
            const SizedBox(height: 4),
            Text(message!, textAlign: TextAlign.center, style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted)),
          ],
        ],
      ),
    );
  }
}

/// Primary and secondary buttons with the admin accent.
class AdminButton extends StatelessWidget {
  final String label;
  final IconData? icon;
  final VoidCallback? onPressed;
  final bool primary;
  final bool danger;
  final bool busy;

  const AdminButton(
    this.label, {
    super.key,
    this.icon,
    required this.onPressed,
    this.primary = true,
    this.danger = false,
    this.busy = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = danger ? AppColors.bad : AppColors.adminAccent;
    final child = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (busy)
          SizedBox(
            width: 16,
            height: 16,
            child: CircularProgressIndicator(strokeWidth: 2, color: primary ? AppColors.pureWhite : color),
          )
        else if (icon != null)
          Icon(icon, size: 18),
        if (busy || icon != null) const SizedBox(width: 8),
        Flexible(child: Text(label, overflow: TextOverflow.ellipsis)),
      ],
    );
    final shape = RoundedRectangleBorder(borderRadius: BorderRadius.circular(10));
    const padding = EdgeInsets.symmetric(horizontal: 16, vertical: 12);
    final textStyle = AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700);
    if (primary) {
      return FilledButton(
        onPressed: busy ? null : onPressed,
        style: FilledButton.styleFrom(backgroundColor: color, shape: shape, padding: padding, textStyle: textStyle, minimumSize: const Size(0, 44)),
        child: child,
      );
    }
    return OutlinedButton(
      onPressed: busy ? null : onPressed,
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        side: BorderSide(color: danger ? AppColors.badBorder : AppColors.border),
        shape: shape,
        padding: padding,
        textStyle: textStyle,
        minimumSize: const Size(0, 44),
      ),
      child: child,
    );
  }
}

/// Opens a detail or form panel: a tall bottom sheet on phones, a panel on
/// the right edge on tablets, so the list stays in view.
Future<T?> showAdminPanel<T>(BuildContext context, {required WidgetBuilder builder, double tabletWidth = 520}) {
  final wide = MediaQuery.sizeOf(context).width >= ResponsiveLayout.navigationBreakpoint;
  if (wide) {
    return showGeneralDialog<T>(
      context: context,
      barrierDismissible: true,
      barrierLabel: MaterialLocalizations.of(context).modalBarrierDismissLabel,
      barrierColor: Colors.black.withValues(alpha: 0.28),
      transitionDuration: const Duration(milliseconds: 220),
      pageBuilder: (ctx, _, _) => Align(
        alignment: Alignment.centerRight,
        child: Material(
          color: AppColors.frenchPaper,
          elevation: 12,
          child: SizedBox(
            width: tabletWidth.clamp(320, MediaQuery.sizeOf(ctx).width * 0.9),
            height: double.infinity,
            child: SafeArea(left: false, child: builder(ctx)),
          ),
        ),
      ),
      transitionBuilder: (ctx, anim, _, child) => SlideTransition(
        position: Tween(begin: const Offset(1, 0), end: Offset.zero).animate(CurvedAnimation(parent: anim, curve: Curves.easeOutCubic)),
        child: child,
      ),
    );
  }
  return showModalBottomSheet<T>(
    context: context,
    isScrollControlled: true,
    useSafeArea: true,
    backgroundColor: AppColors.frenchPaper,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
    builder: (ctx) => FractionallySizedBox(heightFactor: 0.94, child: builder(ctx)),
  );
}

/// Standard layout inside a panel: title bar, scrolling body, action bar.
class AdminPanel extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Widget? leading;
  final List<Widget> children;
  final List<Widget> actions;
  final EdgeInsetsGeometry padding;

  const AdminPanel({
    super.key,
    required this.title,
    this.subtitle,
    this.leading,
    required this.children,
    this.actions = const [],
    this.padding = const EdgeInsets.fromLTRB(18, 8, 18, 24),
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          color: AppColors.pureWhite,
          padding: const EdgeInsets.fromLTRB(18, 14, 8, 12),
          child: Row(
            children: [
              if (leading != null) ...[leading!, const SizedBox(width: 12)],
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title, style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink), maxLines: 2, overflow: TextOverflow.ellipsis),
                    if (subtitle != null)
                      Text(subtitle!, style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 2, overflow: TextOverflow.ellipsis),
                  ],
                ),
              ),
              IconButton(
                tooltip: MaterialLocalizations.of(context).closeButtonTooltip,
                icon: const Icon(Icons.close, color: AppColors.textMuted),
                onPressed: () => Navigator.of(context).maybePop(),
              ),
            ],
          ),
        ),
        const Divider(height: 1, color: AppColors.border),
        Expanded(child: ListView(padding: padding, children: children)),
        if (actions.isNotEmpty)
          Container(
            decoration: const BoxDecoration(
              color: AppColors.pureWhite,
              border: Border(top: BorderSide(color: AppColors.border)),
            ),
            padding: EdgeInsets.fromLTRB(16, 12, 16, 12 + MediaQuery.viewPaddingOf(context).bottom * 0),
            child: SafeArea(
              top: false,
              child: Row(
                children: [
                  for (var i = 0; i < actions.length; i++) ...[
                    if (i > 0) const SizedBox(width: 10),
                    Expanded(child: actions[i]),
                  ],
                ],
              ),
            ),
          ),
      ],
    );
  }
}

/// Section title inside panels and forms.
class PanelSection extends StatelessWidget {
  final String title;
  final Widget? trailing;
  const PanelSection(this.title, {super.key, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 18, bottom: 8),
      child: Row(
        children: [
          Expanded(
            child: Text(
              title.toUpperCase(),
              style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontWeight: FontWeight.w800, letterSpacing: 0.8, fontSize: 11),
            ),
          ),
          ?trailing,
        ],
      ),
    );
  }
}

/// Asks before a destructive or important action.
Future<bool> confirmAdmin(
  BuildContext context, {
  required String title,
  required String message,
  required String confirmLabel,
  bool danger = true,
}) async {
  final ok = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      title: Text(title, style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800)),
      content: Text(message, style: AppTypography.bodyMedium.copyWith(color: AppColors.text, height: 1.45)),
      actions: [
        TextButton(onPressed: () => Navigator.pop(ctx, false), child: Text(ctx.isFrench ? 'Annuler' : 'Cancel')),
        FilledButton(
          onPressed: () => Navigator.pop(ctx, true),
          style: FilledButton.styleFrom(backgroundColor: danger ? AppColors.bad : AppColors.adminAccent),
          child: Text(confirmLabel),
        ),
      ],
    ),
  );
  return ok == true;
}

/// Short confirmation or error message at the bottom of the screen.
void adminToast(BuildContext context, String message, {bool error = false}) {
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      behavior: SnackBarBehavior.floating,
      backgroundColor: error ? AppColors.bad : AppColors.ink,
      content: Text(message),
    ),
  );
}

/// The message of a failed request, as the server phrased it when it did.
String apiErrorText(BuildContext context, Object error) {
  if (error is ApiException && error.message.isNotEmpty) return error.message;
  return context.isFrench ? 'Une erreur est survenue. Réessayez.' : 'Something went wrong. Please try again.';
}

/// Form field with the admin look.
class AdminField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String? hint;
  final TextInputType? keyboardType;
  final bool obscure;
  final int maxLines;
  final String? Function(String?)? validator;
  final Widget? suffix;
  final bool enabled;

  const AdminField({
    super.key,
    required this.label,
    required this.controller,
    this.hint,
    this.keyboardType,
    this.obscure = false,
    this.maxLines = 1,
    this.validator,
    this.suffix,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscure,
        maxLines: obscure ? 1 : maxLines,
        validator: validator,
        enabled: enabled,
        style: AppTypography.bodyMedium,
        decoration: adminInputDecoration(label, hint: hint, suffix: suffix),
      ),
    );
  }
}

InputDecoration adminInputDecoration(String label, {String? hint, Widget? suffix}) => InputDecoration(
      labelText: label,
      hintText: hint,
      suffixIcon: suffix,
      filled: true,
      fillColor: AppColors.pureWhite,
      isDense: true,
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
      labelStyle: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: AppColors.border)),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(10),
        borderSide: const BorderSide(color: AppColors.adminAccent, width: 1.5),
      ),
    );

/// Drop-down with the admin look.
class AdminSelect<T> extends StatelessWidget {
  final String label;
  final T? value;
  final List<FilterOption<T>> options;
  final ValueChanged<T?> onChanged;
  final String? Function(T?)? validator;

  const AdminSelect({super.key, required this.label, required this.value, required this.options, required this.onChanged, this.validator});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: DropdownButtonFormField<T>(
        initialValue: options.any((o) => o.value == value) ? value : null,
        isExpanded: true,
        validator: validator,
        decoration: adminInputDecoration(label),
        items: [
          for (final o in options)
            DropdownMenuItem(value: o.value, child: Text(o.label, overflow: TextOverflow.ellipsis, style: AppTypography.bodyMedium)),
        ],
        onChanged: onChanged,
      ),
    );
  }
}
