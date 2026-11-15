import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';

/// The AI panel's colours (the same violet as on the web).
class AiColors {
  static const ai = Color(0xFF6D4AFF);
  static const ink = Color(0xFF4C2FD1);
  static const soft = Color(0xFFF4F1FF);
  static const line = Color(0xFFE4DDFF);
  static const card = Color(0xFFFCFBFF);
  static const whatsapp = Color(0xFF1FA855);
}

/// A numbered step of the AI panel: its number, its title, a hint, then its content.
class AiStep extends StatelessWidget {
  final int n;
  final String title;
  final String? hint;
  final Widget child;
  final bool first;
  const AiStep({super.key, required this.n, required this.title, this.hint, required this.child, this.first = false});

  @override
  Widget build(BuildContext context) => Container(
    padding: EdgeInsets.only(top: first ? 4 : 14, bottom: 4),
    decoration: first ? null : const BoxDecoration(border: Border(top: BorderSide(color: Color(0xFFF1EEFC)))),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Container(
              width: 22,
              height: 22,
              alignment: Alignment.center,
              decoration: const BoxDecoration(color: AiColors.soft, shape: BoxShape.circle),
              child: Text('$n', style: AppTypography.caption.copyWith(fontWeight: FontWeight.w900, color: AiColors.ink, fontSize: 11)),
            ),
            const SizedBox(width: 8),
            Flexible(child: Text(title, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink))),
            if (hint != null) ...[
              const SizedBox(width: 6),
              Flexible(child: Text(hint!, maxLines: 1, overflow: TextOverflow.ellipsis, style: AppTypography.caption.copyWith(color: AppColors.textMuted))),
            ],
          ],
        ),
        const SizedBox(height: 10),
        child,
      ],
    ),
  );
}

/// A choice as a pill: an icon, a word; violet when chosen (green for WhatsApp).
class AiPill extends StatelessWidget {
  final String label;
  final IconData? icon;
  final bool selected;
  final bool whatsapp;
  final VoidCallback? onTap;
  const AiPill({super.key, required this.label, this.icon, required this.selected, this.whatsapp = false, this.onTap});

  @override
  Widget build(BuildContext context) {
    final on = whatsapp ? AiColors.whatsapp : AiColors.ai;
    final ink = whatsapp ? const Color(0xFF146C3A) : AiColors.ink;
    return Semantics(
      button: true,
      selected: selected,
      child: Material(
        color: selected ? (whatsapp ? const Color(0xFFECFDF3) : AiColors.soft) : AppColors.pureWhite,
        shape: StadiumBorder(side: BorderSide(color: selected ? on : const Color(0xFFE5E7EB), width: selected ? 1.5 : 1)),
        child: InkWell(
          customBorder: const StadiumBorder(),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (icon != null) ...[Icon(icon, size: 16, color: selected ? on : AppColors.textMuted), const SizedBox(width: 6)],
                Flexible(
                  child: Text(
                    label,
                    overflow: TextOverflow.ellipsis,
                    style: AppTypography.caption.copyWith(fontSize: 12.5, fontWeight: FontWeight.w700, color: selected ? ink : AppColors.ink),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// One of the two buttons of the email, as a small card.
class AiButtonCard extends StatelessWidget {
  final String title;
  final String? hint;
  final bool primary;
  final List<Widget> children;
  const AiButtonCard({super.key, required this.title, this.hint, this.primary = false, required this.children});

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: primary ? AppColors.pureWhite : AiColors.card,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: primary ? AiColors.line : const Color(0xFFECE9F7)),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text.rich(
          TextSpan(
            text: title.toUpperCase(),
            style: AppTypography.caption.copyWith(fontSize: 11, fontWeight: FontWeight.w800, letterSpacing: 0.6, color: AppColors.textMuted),
            children: [if (hint != null) TextSpan(text: '  $hint', style: const TextStyle(fontWeight: FontWeight.w600, letterSpacing: 0))],
          ),
        ),
        const SizedBox(height: 8),
        ...children,
      ],
    ),
  );
}

/// An optional extra (a campaign to promote, a picture): an icon, two lines, a control.
class AiExtra extends StatelessWidget {
  final IconData icon;
  final Color tint;
  final Color tintBg;
  final String title;
  final String text;
  final Widget? trailing;
  final Widget? body;
  final bool on;
  const AiExtra({super.key, required this.icon, required this.tint, required this.tintBg, required this.title, required this.text, this.trailing, this.body, this.on = false});

  @override
  Widget build(BuildContext context) => Container(
    decoration: BoxDecoration(
      color: on ? AiColors.card : AppColors.pureWhite,
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: on ? AiColors.line : const Color(0xFFECE9F7)),
    ),
    padding: const EdgeInsets.all(12),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(color: tintBg, borderRadius: BorderRadius.circular(10)),
              child: Icon(icon, size: 18, color: tint),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink)),
                  Text(text, style: AppTypography.caption.copyWith(color: AppColors.textMuted, height: 1.3)),
                ],
              ),
            ),
            if (trailing != null) ...[const SizedBox(width: 8), trailing!],
          ],
        ),
        if (body != null) ...[const SizedBox(height: 10), body!],
      ],
    ),
  );
}

/// Where the picture goes, with a small drawing of the email.
class AiPlaceTile extends StatelessWidget {
  final bool top;
  final String label;
  final bool selected;
  final VoidCallback? onTap;
  const AiPlaceTile({super.key, required this.top, required this.label, required this.selected, this.onTap});

  @override
  Widget build(BuildContext context) {
    Widget bar(double w, double h, Color c) => Container(width: w, height: h, margin: const EdgeInsets.only(bottom: 3), decoration: BoxDecoration(color: c, borderRadius: BorderRadius.circular(2)));
    const picture = LinearGradient(colors: [Color(0xFFC4B5FD), AiColors.ai]);
    final drawing = Container(
      width: 34,
      height: 42,
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(color: const Color(0xFFF1F3F8), borderRadius: BorderRadius.circular(6)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: top
            ? [
                Container(height: 13, margin: const EdgeInsets.only(bottom: 3), decoration: BoxDecoration(gradient: picture, borderRadius: BorderRadius.circular(3))),
                bar(18, 4, const Color(0xFF94A3B8)),
                bar(24, 3, const Color(0xFFCBD5E1)),
              ]
            : [
                bar(18, 4, const Color(0xFF94A3B8)),
                Container(height: 10, margin: const EdgeInsets.only(bottom: 3), decoration: BoxDecoration(gradient: picture, borderRadius: BorderRadius.circular(3))),
                bar(24, 3, const Color(0xFFCBD5E1)),
              ],
      ),
    );
    return Semantics(
      button: true,
      selected: selected,
      child: Material(
        color: AppColors.pureWhite,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: BorderSide(color: selected ? AiColors.ai : const Color(0xFFE5E7EB), width: selected ? 1.5 : 1)),
        child: InkWell(
          borderRadius: BorderRadius.circular(10),
          onTap: onTap,
          child: Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                drawing,
                const SizedBox(width: 8),
                Expanded(
                  child: Text(label, style: AppTypography.caption.copyWith(fontWeight: FontWeight.w700, color: selected ? AiColors.ink : AppColors.ink)),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

/// The colour of a model's state (answered, not on the project, busy).
Color modelStateColor(dynamic state) => switch (state) {
  'ok' => const Color(0xFF10B981),
  'missing' || 'error' => const Color(0xFFF59E0B),
  'busy' => const Color(0xFF3B82F6),
  _ => const Color(0xFFCBD5E1),
};
