import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../common/admin_kit.dart';

/// Safe, pure-Flutter renderer for `PortalBranding.heroBody`.
/// Supports:
/// - `## Subheading`
/// - `- bullet` / `* bullet` / `• bullet`
/// - `**bold**` and `*italic*` inline emphasis
class HeroRichPreviewText extends StatelessWidget {
  final String text;
  final bool light;
  final bool centered;
  final bool compact;
  final Color accentColor;

  const HeroRichPreviewText({
    super.key,
    required this.text,
    this.light = true,
    this.centered = false,
    this.compact = false,
    required this.accentColor,
  });

  static List<TextSpan> _parseInline(String raw, TextStyle base, Color strongColor) {
    final re = RegExp(r'\*\*(.+?)\*\*|\*(.+?)\*');
    final spans = <TextSpan>[];
    var cursor = 0;
    for (final m in re.allMatches(raw)) {
      if (m.start > cursor) {
        spans.add(TextSpan(text: raw.substring(cursor, m.start), style: base));
      }
      final boldText = m.group(1);
      final italicText = m.group(2);
      if (boldText != null) {
        spans.add(TextSpan(
          text: boldText,
          style: base.copyWith(fontWeight: FontWeight.w700, color: strongColor),
        ));
      } else if (italicText != null) {
        spans.add(TextSpan(
          text: italicText,
          style: base.copyWith(fontStyle: FontStyle.italic),
        ));
      }
      cursor = m.end;
    }
    if (cursor < raw.length) {
      spans.add(TextSpan(text: raw.substring(cursor), style: base));
    }
    return spans;
  }

  @override
  Widget build(BuildContext context) {
    final lines = text.replaceAll('\r\n', '\n').replaceAll('\r', '\n').split('\n');
    final bodyColor = light ? Colors.white.withValues(alpha: 0.9) : const Color(0xFF334155);
    final strongColor = light ? Colors.white : const Color(0xFF0F172A);
    final fontSize = compact ? 11.0 : 12.5;
    final baseStyle = TextStyle(fontSize: fontSize, height: 1.42, color: bodyColor);
    final headingStyle = TextStyle(fontSize: compact ? 11.5 : 13.0, fontWeight: FontWeight.w700, height: 1.35, color: strongColor);

    final widgets = <Widget>[];
    final bullets = <String>[];

    void flushBullets() {
      if (bullets.isEmpty) return;
      widgets.add(Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          for (final item in bullets)
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: centered ? MainAxisSize.min : MainAxisSize.max,
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    margin: EdgeInsets.only(top: compact ? 5 : 6, right: 7),
                    decoration: BoxDecoration(color: accentColor, shape: BoxShape.circle),
                  ),
                  Flexible(
                    child: Text.rich(
                      TextSpan(children: _parseInline(item, baseStyle, strongColor)),
                      textAlign: TextAlign.left,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ));
      bullets.clear();
    }

    for (final rawLine in lines) {
      final line = rawLine.trim();
      if (line.isEmpty) {
        flushBullets();
        continue;
      }
      final bulletMatch = RegExp(r'^(?:[-*•])\s+(.+)$').firstMatch(line);
      if (bulletMatch != null) {
        bullets.add(bulletMatch.group(1)!.trim());
        continue;
      }
      flushBullets();
      final headMatch = RegExp(r'^#{1,3}\s+(.+)$').firstMatch(line);
      if (headMatch != null) {
        widgets.add(Padding(
          padding: const EdgeInsets.only(top: 2, bottom: 3),
          child: Text.rich(
            TextSpan(children: _parseInline(headMatch.group(1)!.trim(), headingStyle, strongColor)),
            textAlign: centered ? TextAlign.center : TextAlign.left,
          ),
        ));
      } else {
        widgets.add(Padding(
          padding: const EdgeInsets.only(bottom: 4),
          child: Text.rich(
            TextSpan(children: _parseInline(line, baseStyle, strongColor)),
            textAlign: centered ? TextAlign.center : TextAlign.left,
          ),
        ));
      }
    }
    flushBullets();

    if (widgets.isEmpty) return const SizedBox.shrink();
    return Column(
      crossAxisAlignment: centered ? CrossAxisAlignment.center : CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: widgets,
    );
  }
}

/// Visual formatting toolbar + multiline text input for `heroBody`.
class HeroRichField extends StatelessWidget {
  final TextEditingController controller;
  final ValueChanged<String> onChanged;
  final bool fr;
  final int maxLength;
  final int minLines;

  const HeroRichField({
    super.key,
    required this.controller,
    required this.onChanged,
    required this.fr,
    this.maxLength = 1000,
    this.minLines = 3,
  });

  void _updateText(String next, int start, int end) {
    final clipped = next.length > maxLength ? next.substring(0, maxLength) : next;
    final safeStart = start.clamp(0, clipped.length);
    final safeEnd = end.clamp(safeStart, clipped.length);
    controller.value = TextEditingValue(
      text: clipped,
      selection: TextSelection(baseOffset: safeStart, extentOffset: safeEnd),
    );
    onChanged(clipped);
  }

  void _wrap(String marker, String fallback) {
    final text = controller.text;
    final sel = controller.selection;
    final start = sel.isValid ? sel.start : text.length;
    final end = sel.isValid ? sel.end : text.length;
    final selected = text.substring(start, end);
    final inner = selected.isNotEmpty ? selected : fallback;
    final inserted = '$marker$inner$marker';
    final next = '${text.substring(0, start)}$inserted${text.substring(end)}';
    _updateText(next, start + marker.length, start + marker.length + inner.length);
  }

  void _prefix(String prefix, String fallback) {
    final text = controller.text;
    final sel = controller.selection;
    final start = sel.isValid ? sel.start : text.length;
    final end = sel.isValid ? sel.end : text.length;
    final lineStart = start == 0 ? 0 : text.lastIndexOf('\n', start - 1) + 1;
    final nextNl = text.indexOf('\n', end);
    final lineEnd = nextNl == -1 ? text.length : nextNl;
    final slice = text.substring(lineStart, lineEnd);

    if (slice.trim().isEmpty) {
      final sep = text.isNotEmpty && !text.endsWith('\n') ? '\n' : '';
      final inserted = '$sep$prefix$fallback';
      final next = '${text.substring(0, start)}$inserted${text.substring(end)}';
      final s = start + sep.length + prefix.length;
      _updateText(next, s, s + fallback.length);
      return;
    }

    final updated = slice.split('\n').map((l) {
      if (l.trim().isEmpty) return l;
      if (l.startsWith(prefix)) return l;
      return '$prefix${l.replaceFirst(RegExp(r'^(?:[-*•]|#{1,3})\s+'), '')}';
    }).join('\n');
    final next = '${text.substring(0, lineStart)}$updated${text.substring(lineEnd)}';
    _updateText(next, lineStart, lineStart + updated.length);
  }

  void _insertSample() {
    final sample = fr
        ? '## Votre espace de formation\n- Examens blancs **TCF Canada** au format officiel\n- Corrections par **IA** à l’écrit et à l’oral\n- Suivi continu de votre *niveau NCLC*'
        : '## Your training workspace\n- Full **TCF Canada** mock exams in official format\n- Instant **AI feedback** for writing and speaking\n- Track your *NCLC level* every step of the way';
    _updateText(sample, sample.length, sample.length);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: AppColors.border),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
            decoration: const BoxDecoration(
              color: Color(0xFFF8FAFC),
              border: Border(bottom: BorderSide(color: AppColors.border)),
            ),
            child: Wrap(
              spacing: 2,
              runSpacing: 2,
              crossAxisAlignment: WrapCrossAlignment.center,
              children: [
                IconButton(
                  tooltip: fr ? 'Gras (**texte**)' : 'Bold (**text**)',
                  icon: const Icon(Icons.format_bold, size: 17),
                  visualDensity: VisualDensity.compact,
                  constraints: const BoxConstraints(minWidth: 30, minHeight: 30),
                  onPressed: () => _wrap('**', fr ? 'texte en gras' : 'bold text'),
                ),
                IconButton(
                  tooltip: fr ? 'Italique (*texte*)' : 'Italic (*text*)',
                  icon: const Icon(Icons.format_italic, size: 17),
                  visualDensity: VisualDensity.compact,
                  constraints: const BoxConstraints(minWidth: 30, minHeight: 30),
                  onPressed: () => _wrap('*', fr ? 'texte en italique' : 'italic text'),
                ),
                IconButton(
                  tooltip: fr ? 'Liste à puces (- élément)' : 'Bullet list (- item)',
                  icon: const Icon(Icons.format_list_bulleted, size: 17),
                  visualDensity: VisualDensity.compact,
                  constraints: const BoxConstraints(minWidth: 30, minHeight: 30),
                  onPressed: () => _prefix('- ', fr ? 'Point clé' : 'Key point'),
                ),
                IconButton(
                  tooltip: fr ? 'Sous-titre (## Titre)' : 'Subheading (## Title)',
                  icon: const Text('H', style: TextStyle(fontWeight: FontWeight.w800, fontSize: 13)),
                  visualDensity: VisualDensity.compact,
                  constraints: const BoxConstraints(minWidth: 30, minHeight: 30),
                  onPressed: () => _prefix('## ', fr ? 'Sous-titre' : 'Heading'),
                ),
                if (controller.text.trim().isEmpty)
                  TextButton(
                    style: TextButton.styleFrom(
                      visualDensity: VisualDensity.compact,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                    onPressed: _insertSample,
                    child: Text(fr ? 'Exemple' : 'Sample', style: const TextStyle(fontSize: 11.5)),
                  ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Text(
                    '${controller.text.length}/$maxLength',
                    style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 10.5),
                  ),
                ),
              ],
            ),
          ),
          TextField(
            controller: controller,
            maxLength: maxLength,
            minLines: minLines,
            maxLines: 6,
            onChanged: onChanged,
            decoration: adminInputDecoration(
              fr ? 'Texte & liste de présentation (facultatif)' : 'Hero text & bullet list (optional)',
            ).copyWith(
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              counterText: '',
              hintText: fr
                  ? '- Examens au **format officiel**\n- Suivi de votre *progression*'
                  : '- **Official format** mock tests\n- Track your *progress*',
              contentPadding: const EdgeInsets.all(10),
            ),
          ),
        ],
      ),
    );
  }
}
