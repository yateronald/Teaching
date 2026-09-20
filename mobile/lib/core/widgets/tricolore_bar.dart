import 'package:flutter/material.dart';

/// The signature French Tricolore bar: Blue, White, Red stripes.
class TricoloreBar extends StatelessWidget {
  final double height;
  final BorderRadius? borderRadius;

  const TricoloreBar({
    super.key,
    this.height = 3.5,
    this.borderRadius,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: borderRadius ?? BorderRadius.zero,
      child: SizedBox(
        height: height,
        child: Row(
          children: const [
            Expanded(child: ColoredBox(color: Color(0xFF1E40AF))), // Blue
            Expanded(child: ColoredBox(color: Color(0xFFFFFFFF))), // White
            Expanded(child: ColoredBox(color: Color(0xFFC8102E))), // Red
          ],
        ),
      ),
    );
  }
}
