import 'package:flutter/material.dart';

/// A reusable SliverPersistentHeaderDelegate for pinning sticky search
/// and filter toolbars at the top of scroll views.
class SliverStickyHeaderDelegate extends SliverPersistentHeaderDelegate {
  final double minHeight;
  final double maxHeight;
  final Widget child;

  SliverStickyHeaderDelegate({
    required double height,
    required this.child,
  })  : minHeight = height,
        maxHeight = height;

  SliverStickyHeaderDelegate.range({
    required this.minHeight,
    required this.maxHeight,
    required this.child,
  });

  @override
  double get minExtent => minHeight;

  @override
  double get maxExtent => maxHeight;

  @override
  Widget build(
    BuildContext context,
    double shrinkOffset,
    bool overlapsContent,
  ) {
    return child;
  }

  @override
  bool shouldRebuild(covariant SliverStickyHeaderDelegate oldDelegate) {
    return minHeight != oldDelegate.minHeight ||
        maxHeight != oldDelegate.maxHeight ||
        child != oldDelegate.child;
  }
}
