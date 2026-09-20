import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';

enum ButtonVariant { primary, secondary, danger, ghost }

class CustomButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final ButtonVariant variant;
  final IconData? icon;
  final bool isLoading;
  final double? width;
  final double height;
  final EdgeInsetsGeometry? padding;

  const CustomButton({
    super.key,
    required this.text,
    this.onPressed,
    this.variant = ButtonVariant.primary,
    this.icon,
    this.isLoading = false,
    this.width,
    this.height = 48,
    this.padding,
  });

  @override
  Widget build(BuildContext context) {
    Color bg;
    Color fg;
    BorderSide borderSide = BorderSide.none;

    switch (variant) {
      case ButtonVariant.primary:
        bg = AppColors.frenchNavy;
        fg = AppColors.pureWhite;
        break;
      case ButtonVariant.secondary:
        bg = AppColors.pureWhite;
        fg = AppColors.frenchNavy;
        borderSide = const BorderSide(color: AppColors.border, width: 1.2);
        break;
      case ButtonVariant.danger:
        bg = AppColors.bad;
        fg = AppColors.pureWhite;
        break;
      case ButtonVariant.ghost:
        bg = Colors.transparent;
        fg = AppColors.frenchNavy;
        break;
    }

    return SizedBox(
      width: width,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          elevation: variant == ButtonVariant.primary ? 1.5 : 0,
          shadowColor: AppColors.frenchNavy.withValues(alpha: 0.2),
          side: borderSide,
          padding: padding ?? const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
        child: isLoading
            ? SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2.2,
                  valueColor: AlwaysStoppedAnimation<Color>(fg),
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: 18, color: fg),
                    const SizedBox(width: 8),
                  ],
                  Text(
                    text,
                    style: AppTypography.button.copyWith(color: fg),
                  ),
                ],
              ),
      ),
    );
  }
}
