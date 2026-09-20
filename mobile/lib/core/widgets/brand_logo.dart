import 'package:flutter/material.dart';
import '../constants/app_assets.dart';
import '../constants/app_colors.dart';

/// Renders the official Learn French with Natives brand logo
class BrandLogo extends StatelessWidget {
  final double? height;
  final double? width;
  final BoxFit fit;
  final bool tight;
  final String? heroTag;

  const BrandLogo({
    super.key,
    this.height = 56,
    this.width,
    this.fit = BoxFit.contain,
    this.tight = true,
    this.heroTag,
  });

  @override
  Widget build(BuildContext context) {
    final imageWidget = Image.asset(
      tight ? AppAssets.logoTight : AppAssets.logo,
      height: height,
      width: width,
      fit: fit,
      errorBuilder: (context, error, stackTrace) {
        return Container(
          height: height ?? 40,
          width: width ?? 120,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: AppColors.frenchNavy.withValues(alpha: 0.05),
            borderRadius: BorderRadius.circular(8),
          ),
          child: const Text(
            'Learn French',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: AppColors.frenchNavy,
            ),
          ),
        );
      },
    );

    if (heroTag != null) {
      return Hero(tag: heroTag!, child: imageWidget);
    }
    return imageWidget;
  }
}

/// Renders the book/flag emblem mark in a square badge, identical to the web app .al-brand-mark
class BrandMark extends StatelessWidget {
  final double size;
  final double borderRadius;

  const BrandMark({
    super.key,
    this.size = 36,
    this.borderRadius = 10,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(borderRadius),
        border: Border.all(color: AppColors.border),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 3,
            offset: const Offset(0, 1),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Center(
        child: Image.asset(
          AppAssets.logoMark,
          width: size * 0.82,
          height: size * 0.82,
          fit: BoxFit.contain,
          errorBuilder: (context, error, stackTrace) {
            return Icon(
              Icons.auto_stories,
              size: size * 0.55,
              color: AppColors.frenchNavy,
            );
          },
        ),
      ),
    );
  }
}
