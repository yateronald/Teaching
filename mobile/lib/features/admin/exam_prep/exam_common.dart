import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../../../core/responsive/responsive_layout.dart';
import '../common/admin_kit.dart';

/// The four TCF skills. The category name decides which one a category is,
/// exactly as on the web.
enum Skill { ce, co, ee, eo, other }

extension SkillX on Skill {
  static Skill ofCategory(String? name) => switch (name) {
        'Compréhension Écrite' => Skill.ce,
        'Compréhension Orale' => Skill.co,
        'Expression Écrite' => Skill.ee,
        'Expression Orale' => Skill.eo,
        _ => Skill.other,
      };

  static Skill ofType(String type) => switch (type.length >= 2 ? type.substring(0, 2) : '') {
        'ce' => Skill.ce,
        'co' => Skill.co,
        'ee' => Skill.ee,
        'eo' => Skill.eo,
        _ => Skill.other,
      };

  String get code => switch (this) { Skill.ce => 'CE', Skill.co => 'CO', Skill.ee => 'EE', Skill.eo => 'EO', Skill.other => 'TCF' };

  String label(bool fr) => switch (this) {
        Skill.ce => fr ? 'Compréhension écrite' : 'Reading',
        Skill.co => fr ? 'Compréhension orale' : 'Listening',
        Skill.ee => fr ? 'Expression écrite' : 'Writing',
        Skill.eo => fr ? 'Expression orale' : 'Speaking',
        Skill.other => 'TCF',
      };

  Color get color => switch (this) {
        Skill.ce => const Color(0xFF0D9488),
        Skill.co => const Color(0xFF4F46E5),
        Skill.ee => const Color(0xFFD97706),
        Skill.eo => const Color(0xFFDB2777),
        Skill.other => AppColors.textMuted,
      };

  IconData get icon => switch (this) {
        Skill.ce => Icons.menu_book_outlined,
        Skill.co => Icons.headphones_outlined,
        Skill.ee => Icons.edit_note,
        Skill.eo => Icons.record_voice_over_outlined,
        Skill.other => Icons.school_outlined,
      };

  /// CE and CO questions live under /tcf and /tcf/co.
  String get prefix => this == Skill.co ? '/tcf/co' : '/tcf';

  /// The year → month → … tree prefix for EE and EO.
  String get tree => this == Skill.eo ? '/tcf/eo' : '/tcf/ee';

  bool get hasYears => this == Skill.ee || this == Skill.eo;
}

const cefrLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const frenchMonths = {
  1: 'Janvier', 2: 'Février', 3: 'Mars', 4: 'Avril', 5: 'Mai', 6: 'Juin',
  7: 'Juillet', 8: 'Août', 9: 'Septembre', 10: 'Octobre', 11: 'Novembre', 12: 'Décembre',
};

/// EE tâches: type, words and minutes are fixed by the exam.
const eeTasks = {
  1: (type: 'message_court', label: 'Message court', min: 60, max: 120, dur: 10),
  2: (type: 'narration', label: 'Narration', min: 120, max: 150, dur: 20),
  3: (type: 'argumentation', label: 'Argumentation', min: 120, max: 180, dur: 30),
};

/// EO tâches: preparation and speaking time in minutes.
const eoTasks = {
  1: (type: 'presentation', label: 'Présentation', prep: 0.0, dur: 2.0),
  2: (type: 'interaction', label: 'Interaction orale', prep: 2.0, dur: 3.5),
  3: (type: 'argumentation', label: 'Argumentation', prep: 0.0, dur: 4.5),
};

/// "Série 12" → 12, for sorting series the way people number them.
int numberIn(String name) => int.tryParse(RegExp(r'\d+').firstMatch(name)?.group(0) ?? '') ?? 0;

String minutesText(num minutes) {
  final m = minutes.floor();
  final s = ((minutes - m) * 60).round();
  return s == 0 ? '$m min' : '$m min $s s';
}

String secondsText(num? seconds) {
  if (seconds == null || seconds == 0) return '';
  final m = seconds ~/ 60, s = (seconds % 60).round();
  return m == 0 ? '$s s' : s == 0 ? '$m min' : '$m min $s s';
}

/// A full screen one level down the content tree (a skill, a year, a
/// series…). It is pushed on the navigator, so back and swipe-back work.
class ExamScaffold extends StatelessWidget {
  final String title;
  final String? subtitle;
  final Skill skill;
  final List<Widget> actions;
  final Widget body;
  final Widget? fab;

  const ExamScaffold({super.key, required this.title, this.subtitle, required this.skill, this.actions = const [], required this.body, this.fab});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.frenchPaper,
      appBar: AppBar(
        backgroundColor: AppColors.pureWhite,
        surfaceTintColor: AppColors.pureWhite,
        foregroundColor: AppColors.ink,
        elevation: 0,
        scrolledUnderElevation: 0.5,
        titleSpacing: 0,
        title: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(color: skill.color.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
              child: Icon(skill.icon, size: 18, color: skill.color),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink), maxLines: 1, overflow: TextOverflow.ellipsis),
                  if (subtitle != null)
                    Text(subtitle!, style: AppTypography.caption.copyWith(color: AppColors.textMuted, fontSize: 11.5), maxLines: 1, overflow: TextOverflow.ellipsis),
                ],
              ),
            ),
          ],
        ),
        actions: [...actions, const SizedBox(width: 4)],
        bottom: const PreferredSize(preferredSize: Size.fromHeight(1), child: Divider(height: 1, color: AppColors.border)),
      ),
      floatingActionButton: fab,
      body: SafeArea(top: false, child: body),
    );
  }
}

/// The main "add" button of a level.
class ExamFab extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  const ExamFab(this.label, {super.key, required this.onPressed});

  @override
  Widget build(BuildContext context) => FloatingActionButton.extended(
        heroTag: null,
        onPressed: onPressed,
        backgroundColor: AppColors.adminAccent,
        foregroundColor: AppColors.pureWhite,
        icon: const Icon(Icons.add),
        label: Text(label, style: const TextStyle(fontWeight: FontWeight.w700)),
      );
}

/// A tappable card of the content tree, with an optional overflow menu.
class TreeCard extends StatelessWidget {
  final Widget leading;
  final String title;
  final String? subtitle;
  final Widget? footer;
  final VoidCallback onTap;
  final List<PopupMenuEntry<VoidCallback>> menu;
  final bool warn;

  const TreeCard({super.key, required this.leading, required this.title, this.subtitle, this.footer, required this.onTap, this.menu = const [], this.warn = false});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: AppColors.pureWhite,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.fromLTRB(14, 12, 4, 12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: warn ? AppColors.warn.withValues(alpha: 0.45) : AppColors.border),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                children: [
                  leading,
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(title, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: AppColors.ink), maxLines: 2, overflow: TextOverflow.ellipsis),
                        if (subtitle != null)
                          Text(subtitle!, style: AppTypography.caption.copyWith(color: AppColors.textMuted), maxLines: 2, overflow: TextOverflow.ellipsis),
                      ],
                    ),
                  ),
                  if (menu.isNotEmpty)
                    PopupMenuButton<VoidCallback>(
                      icon: const Icon(Icons.more_vert, color: AppColors.textMuted),
                      itemBuilder: (_) => menu,
                      onSelected: (action) => action(),
                    )
                  else
                    const Padding(padding: EdgeInsets.only(right: 8), child: Icon(Icons.chevron_right, color: AppColors.textSubtle)),
                ],
              ),
              if (footer != null) Padding(padding: const EdgeInsets.only(top: 10, right: 10), child: footer!),
            ],
          ),
        ),
      ),
    );
  }
}

PopupMenuItem<VoidCallback> menuItem(IconData icon, String label, VoidCallback action, {bool danger = false}) => PopupMenuItem(
      value: action,
      child: Row(
        children: [
          Icon(icon, size: 18, color: danger ? AppColors.bad : AppColors.text),
          const SizedBox(width: 10),
          Text(label, style: TextStyle(color: danger ? AppColors.bad : AppColors.ink)),
        ],
      ),
    );

/// Number badge on the left of a tree card.
class NumberBadge extends StatelessWidget {
  final String text;
  final Color color;
  final double size;
  const NumberBadge(this.text, {super.key, required this.color, this.size = 40});

  @override
  Widget build(BuildContext context) => Container(
        width: size,
        height: size,
        alignment: Alignment.center,
        decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(11)),
        child: Text(text, style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w800, color: color)),
      );
}

/// The share of each CEFR level, as one thin stacked bar.
class CefrBar extends StatelessWidget {
  final Map<String, num> dist;
  final double height;
  const CefrBar(this.dist, {super.key, this.height = 6});

  @override
  Widget build(BuildContext context) {
    final parts = [for (final l in cefrLevels) if ((dist[l] ?? 0) > 0) (l, dist[l]!)];
    return ClipRRect(
      borderRadius: BorderRadius.circular(height),
      child: SizedBox(
        height: height,
        child: parts.isEmpty
            ? Container(color: AppColors.borderSoft)
            : Row(children: [for (final p in parts) Expanded(flex: (p.$2 * 10).round().clamp(1, 100000), child: Container(color: Pill.levelColor(p.$1)))]),
      ),
    );
  }
}

/// Grid of cards that becomes a single column on small phones.
class TreeGrid extends StatelessWidget {
  final List<Widget> children;
  const TreeGrid({super.key, required this.children});

  @override
  Widget build(BuildContext context) => AdminGrid(minTileWidth: 300, maxColumns: 3, spacing: 10, children: children);
}

/// Page body for a level: pull to refresh, loading, error and empty states.
class ExamBody extends StatelessWidget {
  final bool loading;
  final String? error;
  final Future<void> Function() onRefresh;
  final bool empty;
  final Widget emptyState;
  final List<Widget> children;
  final Widget? toolbar;

  const ExamBody({
    super.key,
    required this.loading,
    required this.error,
    required this.onRefresh,
    required this.empty,
    required this.emptyState,
    required this.children,
    this.toolbar,
  });

  @override
  Widget build(BuildContext context) {
    if (loading) return const AdminLoading();
    if (error != null) return AdminError(message: error!, onRetry: onRefresh);
    return AdminPage(
      onRefresh: onRefresh,
      toolbar: toolbar,
      children: [
        if (empty) AdminCard(child: emptyState) else ...children,
        const SizedBox(height: 72),
      ],
    );
  }
}

/// A warning line above a list (short series, missing tâches…).
class WarnNote extends StatelessWidget {
  final String text;
  const WarnNote(this.text, {super.key});

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: AppColors.warnBg, borderRadius: BorderRadius.circular(12), border: Border.all(color: AppColors.warn.withValues(alpha: 0.35))),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Icon(Icons.warning_amber_rounded, color: AppColors.warn, size: 20),
            const SizedBox(width: 10),
            Expanded(child: Text(text, style: AppTypography.bodySmall.copyWith(color: AppColors.ink, height: 1.4))),
          ],
        ),
      );
}

/// A number input for forms (duration, thresholds, points…).
class NumberField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final bool decimal;
  final bool required;
  final num? min;

  const NumberField({super.key, required this.label, required this.controller, this.decimal = false, this.required = true, this.min});

  @override
  Widget build(BuildContext context) {
    final fr = context.isFrench;
    return AdminField(
      label: label,
      controller: controller,
      keyboardType: TextInputType.numberWithOptions(decimal: decimal),
      validator: (v) {
        final t = (v ?? '').trim().replaceAll(',', '.');
        if (t.isEmpty) return required ? (fr ? 'Obligatoire' : 'Required') : null;
        final n = num.tryParse(t);
        if (n == null) return fr ? 'Nombre invalide' : 'Not a number';
        if (min != null && n < min!) return fr ? 'Au moins $min' : 'At least $min';
        return null;
      },
    );
  }
}

num? parseNum(String text) => num.tryParse(text.trim().replaceAll(',', '.'));

/// Pushes a level screen.
Future<T?> openLevel<T>(BuildContext context, Widget screen) =>
    Navigator.of(context).push<T>(MaterialPageRoute(builder: (_) => screen));

/// Whether the screen is wide enough for side-by-side form fields.
bool wideForm(BuildContext context) => MediaQuery.sizeOf(context).width >= ResponsiveLayout.mobileBreakpoint;

/// Form fields side by side, in as many columns as fit, without fixing
/// their height (validation messages need room).
class FieldGrid extends StatelessWidget {
  final int columns;
  final List<Widget> children;
  final double spacing;
  const FieldGrid({super.key, required this.columns, required this.children, this.spacing = 10});

  @override
  Widget build(BuildContext context) => LayoutBuilder(
        builder: (context, box) {
          final w = (box.maxWidth - spacing * (columns - 1)) / columns;
          return Wrap(spacing: spacing, children: [for (final c in children) SizedBox(width: w, child: c)]);
        },
      );
}

/// A reading document stored as light markup (the web renders the same):
/// `**Title**` lines, table rows `| a | b |` (a `| --- |` row marks the
/// header, a `<` cell continues the one on its left), `- item` lists and
/// `[image]` slots (the image is shown separately here).
class CeDocumentView extends StatelessWidget {
  final String text;
  final TextStyle? style;
  const CeDocumentView(this.text, {super.key, this.style});

  static final _table = RegExp(r'^\|.*\|$');
  static final _separator = RegExp(r'^\|(?:\s*:?-{3,}:?\s*\|)+$');
  static final _image = RegExp(r'^\[image(?:\s+\d+)?\]$', caseSensitive: false);
  static final _bold = RegExp(r'^\*\*(.+)\*\*$');

  @override
  Widget build(BuildContext context) {
    final base = style ?? AppTypography.bodyMedium.copyWith(height: 1.6, color: AppColors.ink);
    final lines = text.replaceAll('\r\n', '\n').split('\n');
    final children = <Widget>[];
    var paragraph = <String>[];
    void flush() {
      while (paragraph.isNotEmpty && paragraph.last.trim().isEmpty) {
        paragraph.removeLast();
      }
      if (paragraph.isEmpty) return;
      children.add(Text.rich(
        TextSpan(children: [
          for (var i = 0; i < paragraph.length; i++) ...[
            if (i > 0) const TextSpan(text: '\n'),
            if (_bold.hasMatch(paragraph[i].trim()))
              TextSpan(text: _bold.firstMatch(paragraph[i].trim())!.group(1), style: const TextStyle(fontWeight: FontWeight.w800))
            else
              TextSpan(text: paragraph[i].replaceAll('**', '')),
          ],
        ]),
        style: base,
      ));
      paragraph = [];
    }

    for (var i = 0; i < lines.length; i++) {
      final line = lines[i].trim();
      if (_table.hasMatch(line) && !_separator.hasMatch(line)) {
        flush();
        final rows = <List<String>>[];
        var headerRows = 0;
        while (i < lines.length && _table.hasMatch(lines[i].trim())) {
          final row = lines[i].trim();
          if (_separator.hasMatch(row)) {
            if (rows.length == 1) headerRows = 1;
          } else {
            rows.add(row.substring(1, row.length - 1).split('|').map((c) => c.trim() == '<' ? '' : c.trim()).toList());
          }
          i++;
        }
        i--;
        final columns = rows.fold<int>(0, (m, r) => r.length > m ? r.length : m);
        children.add(SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Table(
            defaultColumnWidth: const IntrinsicColumnWidth(),
            border: TableBorder.all(color: AppColors.textSubtle, width: 0.8),
            children: [
              for (var r = 0; r < rows.length; r++)
                TableRow(
                  decoration: r < headerRows ? const BoxDecoration(color: AppColors.borderSoft) : null,
                  children: [
                    for (var c = 0; c < columns; c++)
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
                        child: Text(
                          c < rows[r].length ? rows[r][c].replaceAll('**', '') : '',
                          style: base.copyWith(fontSize: (base.fontSize ?? 14) - 1, fontWeight: r < headerRows ? FontWeight.w700 : null, height: 1.35),
                        ),
                      ),
                  ],
                ),
            ],
          ),
        ));
        continue;
      }
      if (RegExp(r'^[-•]\s+').hasMatch(line)) {
        flush();
        children.add(Padding(
          padding: const EdgeInsets.only(left: 4),
          child: Text('•  ${line.replaceFirst(RegExp(r'^[-•]\s+'), '').replaceAll('**', '')}', style: base),
        ));
        continue;
      }
      if (_image.hasMatch(line)) {
        flush();
        continue;
      }
      if (line.isEmpty && paragraph.isEmpty) continue;
      paragraph.add(lines[i]);
    }
    flush();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        for (var i = 0; i < children.length; i++) ...[
          if (i > 0) const SizedBox(height: 10),
          children[i],
        ],
      ],
    );
  }
}
