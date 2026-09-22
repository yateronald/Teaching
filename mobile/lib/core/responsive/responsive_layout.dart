import 'package:flutter/material.dart';

/// Responsive layout helper with standard breakpoints.
class ResponsiveLayout extends StatelessWidget {
  static const double mobileBreakpoint = 600;
  static const double navigationBreakpoint = 720;
  static const double desktopBreakpoint = 1200;
  static const double expandedNavigationBreakpoint = 1440;
  static const double compactNavigationWidth = 80;
  static const double expandedNavigationWidth = 250;
  static const double maxContentWidth = 1180;

  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  const ResponsiveLayout({
    super.key,
    required this.mobile,
    this.tablet,
    this.desktop,
  });

  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < mobileBreakpoint;

  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= mobileBreakpoint &&
      MediaQuery.of(context).size.width < desktopBreakpoint;

  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= desktopBreakpoint;

  static bool hasPersistentNavigation(BuildContext context) =>
      MediaQuery.of(context).size.width >= navigationBreakpoint;

  static bool defaultsToExpandedNavigation(BuildContext context) =>
      MediaQuery.of(context).size.width >= expandedNavigationBreakpoint;

  static double screenWidth(BuildContext context) =>
      MediaQuery.of(context).size.width;

  static double screenHeight(BuildContext context) =>
      MediaQuery.of(context).size.height;

  /// Page spacing shared by every teacher feature. It stays compact on
  /// tablets and grows only when the viewport has enough useful room.
  static EdgeInsets pageInsets(BuildContext context) {
    final width = screenWidth(context);
    if (width < mobileBreakpoint) {
      return const EdgeInsets.symmetric(horizontal: 16, vertical: 20);
    }
    if (width < desktopBreakpoint) {
      return const EdgeInsets.symmetric(horizontal: 24, vertical: 24);
    }
    return const EdgeInsets.symmetric(horizontal: 32, vertical: 28);
  }

  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= desktopBreakpoint) {
          return desktop ?? tablet ?? mobile;
        }
        if (constraints.maxWidth >= mobileBreakpoint) {
          return tablet ?? mobile;
        }
        return mobile;
      },
    );
  }
}

/// Centers wide feature pages and prevents forms, cards, and tables from
/// stretching to unreadable widths on landscape tablets and desktop.
class AdaptiveContent extends StatelessWidget {
  final Widget child;
  final double maxWidth;

  const AdaptiveContent({
    super.key,
    required this.child,
    this.maxWidth = ResponsiveLayout.maxContentWidth,
  });

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.topCenter,
      child: ConstrainedBox(
        constraints: BoxConstraints(maxWidth: maxWidth),
        child: SizedBox(width: double.infinity, child: child),
      ),
    );
  }
}
