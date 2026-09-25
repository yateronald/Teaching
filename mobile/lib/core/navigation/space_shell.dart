import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../auth/auth_notifier.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';
import '../localization/app_locale_notifier.dart';
import '../localization/translations.dart';
import '../responsive/responsive_layout.dart';
import '../widgets/brand_logo.dart';
import '../widgets/language_switcher_button.dart';
import '../widgets/tricolore_bar.dart';

/// A label in both languages of the app.
typedef Localized = String Function(String lang);

/// A group of the navigation ("Management", "Content"…).
class SpaceSection {
  final String id;
  final Localized label;
  const SpaceSection(this.id, this.label);
}

/// One screen of a space, as listed in its navigation.
class SpaceNavItem {
  final String section;
  final IconData icon;
  final Localized label;

  /// A number shown beside the entry (e.g. new demo requests); 0 hides it.
  final int Function(WidgetRef ref)? badge;

  /// Hides the entry for accounts that may not open it.
  final bool Function(WidgetRef ref)? visible;

  const SpaceNavItem({
    required this.section,
    required this.icon,
    required this.label,
    this.badge,
    this.visible,
  });
}

/// The frame shared by the teacher and admin spaces: a persistent sidebar
/// (collapsible) on tablets, an app bar with a drawer on phones, and the
/// screens kept alive side by side so switching keeps their state.
class SpaceShell extends ConsumerStatefulWidget {
  final Localized spaceLabel;
  final Color accent;
  final Color accentBg;
  final List<SpaceSection> sections;
  final List<SpaceNavItem> items;

  /// Builds the screens, in the order of [items]. `navigate` switches screen.
  final List<Widget> Function(void Function(int index) navigate) pages;

  /// The profile screen, opened by the avatar.
  final int profileIndex;
  final int initialTab;

  /// Default name under the avatar when the account has none.
  final Localized fallbackName;

  const SpaceShell({
    super.key,
    required this.spaceLabel,
    required this.accent,
    required this.accentBg,
    required this.sections,
    required this.items,
    required this.pages,
    required this.profileIndex,
    required this.fallbackName,
    this.initialTab = 0,
  });

  @override
  ConsumerState<SpaceShell> createState() => _SpaceShellState();
}

class _SpaceShellState extends ConsumerState<SpaceShell> {
  late int _currentIndex;
  bool? _navigationExpanded;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  late final List<Widget> _pages;

  /// Screens are built the first time they are opened, then kept alive, so
  /// signing in does not load every screen's data at once.
  final Set<int> _opened = {};

  @override
  void initState() {
    super.initState();
    _currentIndex = widget.initialTab;
    _pages = widget.pages(_onTabSelected);
    _opened.add(_currentIndex);
  }

  List<Widget> get _stack => [
        for (var i = 0; i < _pages.length; i++) _opened.contains(i) ? _pages[i] : const SizedBox.shrink(),
      ];

  void _onTabSelected(int idx) {
    setState(() {
      _currentIndex = idx;
      _opened.add(idx);
    });
    if (_scaffoldKey.currentState?.isDrawerOpen == true) {
      _scaffoldKey.currentState?.closeDrawer();
    }
  }

  String _initial(dynamic user) =>
      user?.fullName.isNotEmpty == true ? user!.fullName[0].toUpperCase() : 'P';

  @override
  Widget build(BuildContext context) {
    final isTablet = ResponsiveLayout.hasPersistentNavigation(context);
    final navigationExpanded =
        _navigationExpanded ?? ResponsiveLayout.defaultsToExpandedNavigation(context);
    final user = ref.watch(authNotifierProvider).user;
    final lang = ref.watch(appLocaleProvider).languageCode;
    final title = widget.items[_currentIndex].label(lang);

    if (isTablet) {
      return Scaffold(
        backgroundColor: AppColors.frenchPaper,
        body: Row(
          children: [
            _buildSidebar(user, lang, navigationExpanded),
            const VerticalDivider(width: 1, color: AppColors.border),
            Expanded(
              child: Column(
                children: [
                  const TricoloreBar(height: 3),
                  _buildTabletTopBar(user, lang, title, navigationExpanded),
                  const Divider(height: 1, color: AppColors.borderSoft),
                  Expanded(child: IndexedStack(index: _currentIndex, children: _stack)),
                ],
              ),
            ),
          ],
        ),
      );
    }

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.frenchPaper,
      appBar: AppBar(
        backgroundColor: AppColors.pureWhite,
        elevation: 0.5,
        leading: IconButton(
          icon: Badge(
            isLabelVisible: _totalBadges() > 0,
            backgroundColor: AppColors.frenchRed,
            smallSize: 8,
            child: const Icon(Icons.menu, color: AppColors.frenchNavy),
          ),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        titleSpacing: 4,
        title: Row(
          children: [
            const BrandMark(size: 26, borderRadius: 6),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                title,
                style: AppTypography.titleMedium.copyWith(
                  color: AppColors.frenchNavy,
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                ),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        actions: [
          const LanguageSwitcherButton(),
          const SizedBox(width: 6),
          Padding(
            padding: const EdgeInsets.only(right: 14),
            child: GestureDetector(
              onTap: () => _onTabSelected(widget.profileIndex),
              child: CircleAvatar(
                radius: 16,
                backgroundColor: AppColors.frenchNavy,
                foregroundColor: AppColors.pureWhite,
                child: Text(
                  _initial(user),
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                ),
              ),
            ),
          ),
        ],
        bottom: const PreferredSize(
          preferredSize: Size.fromHeight(3),
          child: TricoloreBar(height: 3),
        ),
      ),
      drawer: _buildDrawer(user, lang),
      body: IndexedStack(index: _currentIndex, children: _stack),
    );
  }

  int _totalBadges() {
    var total = 0;
    for (final item in widget.items) {
      total += item.badge?.call(ref) ?? 0;
    }
    return total;
  }

  Widget _buildTabletTopBar(dynamic user, String lang, String title, bool navigationExpanded) {
    return Container(
      color: AppColors.pureWhite,
      padding: const EdgeInsets.fromLTRB(10, 10, 20, 10),
      child: Row(
        children: [
          IconButton(
            tooltip: navigationExpanded
                ? (lang == 'en' ? 'Collapse menu' : 'Réduire le menu')
                : (lang == 'en' ? 'Expand menu' : 'Développer le menu'),
            onPressed: () => setState(() => _navigationExpanded = !navigationExpanded),
            icon: Icon(
              navigationExpanded ? Icons.menu_open_rounded : Icons.menu_rounded,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(width: 4),
          Expanded(
            child: Text(
              title,
              style: AppTypography.titleLarge.copyWith(
                fontWeight: FontWeight.w700,
                color: AppColors.frenchNavy,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Row(
            children: [
              const LanguageSwitcherButton(),
              const SizedBox(width: 14),
              if (MediaQuery.sizeOf(context).width >= 960) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.surfaceSoft,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.border),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.public, size: 14, color: AppColors.textMuted),
                      const SizedBox(width: 6),
                      Text(
                        user?.timezone ?? 'Europe/Paris',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 14),
              ],
              GestureDetector(
                onTap: () => _onTabSelected(widget.profileIndex),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: AppColors.frenchNavy,
                      foregroundColor: AppColors.pureWhite,
                      child: Text(_initial(user), style: const TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    const SizedBox(width: 8),
                    if (MediaQuery.sizeOf(context).width >= 980)
                      Text(
                        user?.fullName ?? widget.fallbackName(lang),
                        style: AppTypography.bodySmall.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _spaceTag(String lang, {required bool expanded}) {
    return Tooltip(
      message: widget.spaceLabel(lang),
      child: Row(
        mainAxisAlignment: expanded ? MainAxisAlignment.start : MainAxisAlignment.center,
        children: [
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(color: widget.accent, shape: BoxShape.circle),
          ),
          if (expanded) ...[
            const SizedBox(width: 8),
            Flexible(
              child: Text(
                widget.spaceLabel(lang),
                style: AppTypography.caption.copyWith(
                  color: widget.accent,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  List<Widget> _navList(String lang, {required bool expanded, required double gap}) {
    final children = <Widget>[];
    for (final section in widget.sections) {
      final entries = [
        for (var i = 0; i < widget.items.length; i++)
          if (widget.items[i].section == section.id && (widget.items[i].visible?.call(ref) ?? true)) i,
      ];
      if (entries.isEmpty) continue;
      if (children.isNotEmpty) children.add(SizedBox(height: gap));
      if (expanded) children.add(_buildSectionHeader(section.label(lang)));
      children.addAll(entries.map((i) => _buildNavItem(i, lang, expanded: expanded)));
    }
    return children;
  }

  Widget _buildSidebar(dynamic user, String lang, bool expanded) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 220),
      curve: Curves.easeOutCubic,
      width: expanded
          ? ResponsiveLayout.expandedNavigationWidth
          : ResponsiveLayout.compactNavigationWidth,
      color: AppColors.pureWhite,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: EdgeInsets.fromLTRB(expanded ? 20 : 12, 18, expanded ? 20 : 12, 14),
            child: Column(
              crossAxisAlignment: expanded ? CrossAxisAlignment.start : CrossAxisAlignment.center,
              children: [
                if (expanded)
                  const BrandLogo(height: 40, tight: true)
                else
                  const BrandMark(size: 40, borderRadius: 10),
                const SizedBox(height: 12),
                _spaceTag(lang, expanded: expanded),
              ],
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSoft),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.symmetric(vertical: 12),
              children: _navList(lang, expanded: expanded, gap: 16),
            ),
          ),
          const Divider(height: 1, color: AppColors.borderSoft),
          Padding(
            padding: EdgeInsets.all(expanded ? 16 : 10),
            child: InkWell(
              onTap: () => _onTabSelected(widget.profileIndex),
              borderRadius: BorderRadius.circular(10),
              child: Padding(
                padding: const EdgeInsets.all(6),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 18,
                      backgroundColor: AppColors.frenchNavy,
                      foregroundColor: AppColors.pureWhite,
                      child: Text(_initial(user), style: const TextStyle(fontWeight: FontWeight.bold)),
                    ),
                    if (expanded) ...[
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              user?.fullName ?? widget.fallbackName(lang),
                              style: AppTypography.bodySmall.copyWith(fontWeight: FontWeight.w700),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            Text(
                              widget.items[widget.profileIndex].label(lang),
                              style: AppTypography.caption.copyWith(color: AppColors.textSubtle),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDrawer(dynamic user, String lang) {
    return Drawer(
      backgroundColor: AppColors.pureWhite,
      child: SafeArea(
        child: Column(
          children: [
            const TricoloreBar(height: 4),
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 10),
              child: Row(
                children: [
                  const BrandMark(size: 38, borderRadius: 10),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Learn French',
                          style: AppTypography.bodyMedium.copyWith(
                            fontWeight: FontWeight.w800,
                            color: AppColors.frenchNavy,
                            height: 1.1,
                          ),
                        ),
                        Text(
                          'with Natives',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textMuted,
                            fontWeight: FontWeight.w600,
                            height: 1.1,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.borderSoft),
            Padding(
              padding: const EdgeInsets.all(20),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 24,
                    backgroundColor: AppColors.frenchNavy,
                    foregroundColor: AppColors.pureWhite,
                    child: Text(
                      _initial(user),
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        _spaceTag(lang, expanded: true),
                        const SizedBox(height: 2),
                        Text(
                          user?.fullName ?? widget.fallbackName(lang),
                          style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.w700),
                        ),
                        Text(
                          user?.email ?? '',
                          style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.borderSoft),
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(vertical: 8),
                children: _navList(lang, expanded: true, gap: 12),
              ),
            ),
            const Divider(height: 1, color: AppColors.borderSoft),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    AppTranslations.tr('language', lang: lang),
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.textMuted,
                    ),
                  ),
                  const LanguageSwitcherButton(),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.borderSoft),
            ListTile(
              leading: const Icon(Icons.logout, color: AppColors.bad),
              title: Text(
                AppTranslations.tr('logout', lang: lang),
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.bad,
                  fontWeight: FontWeight.w600,
                ),
              ),
              onTap: () async {
                Navigator.pop(context);
                await ref.read(authNotifierProvider.notifier).logout();
                // The app returns to the sign-in screen on its own (main.dart).
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
      child: Text(
        title,
        style: AppTypography.caption.copyWith(
          color: AppColors.textSubtle,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.2,
          fontSize: 10,
        ),
      ),
    );
  }

  Widget _buildNavItem(int idx, String lang, {bool expanded = true}) {
    final item = widget.items[idx];
    final isSelected = _currentIndex == idx;
    final label = item.label(lang);
    final count = item.badge?.call(ref) ?? 0;

    final icon = Icon(
      item.icon,
      size: 18,
      color: isSelected ? widget.accent : AppColors.textMuted,
    );

    final itemWidget = Padding(
      padding: EdgeInsets.symmetric(horizontal: expanded ? 12 : 10, vertical: 3),
      child: InkWell(
        onTap: () => _onTabSelected(idx),
        borderRadius: BorderRadius.circular(8),
        child: Container(
          padding: EdgeInsets.symmetric(horizontal: expanded ? 12 : 0, vertical: 11),
          decoration: BoxDecoration(
            color: isSelected ? widget.accentBg : Colors.transparent,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisAlignment: expanded ? MainAxisAlignment.start : MainAxisAlignment.center,
            children: [
              if (!expanded && count > 0)
                Badge(backgroundColor: AppColors.frenchRed, smallSize: 8, child: icon)
              else
                icon,
              if (expanded) ...[
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    label,
                    style: AppTypography.bodySmall.copyWith(
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                      color: isSelected ? widget.accent : AppColors.text,
                    ),
                  ),
                ),
              ],
              if (expanded && count > 0)
                Container(
                  constraints: const BoxConstraints(minWidth: 20),
                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                  decoration: BoxDecoration(
                    color: AppColors.frenchRed,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    count > 99 ? '99+' : '$count',
                    textAlign: TextAlign.center,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.pureWhite,
                      fontWeight: FontWeight.w800,
                      fontSize: 11,
                    ),
                  ),
                )
              else if (expanded && isSelected)
                Container(
                  width: 6,
                  height: 6,
                  decoration: BoxDecoration(color: widget.accent, shape: BoxShape.circle),
                ),
            ],
          ),
        ),
      ),
    );

    if (expanded) return itemWidget;
    return Tooltip(
      message: label,
      waitDuration: const Duration(milliseconds: 350),
      child: itemWidget,
    );
  }
}
