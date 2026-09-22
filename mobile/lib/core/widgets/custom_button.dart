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

    final bool isCompact = height <= 40;
    final EdgeInsetsGeometry resolvedPadding = padding ??
        (isCompact
            ? const EdgeInsets.symmetric(horizontal: 12, vertical: 0)
            : const EdgeInsets.symmetric(horizontal: 20, vertical: 12));
    final TextStyle textStyle = isCompact
        ? AppTypography.caption.copyWith(
            color: fg,
            fontWeight: FontWeight.w600,
            fontSize: 13,
          )
        : AppTypography.button.copyWith(color: fg);

    return SizedBox(
      width: width,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading
            ? null
            : () {
                debugPrint('CustomButton tapped! Calling onPressed: $onPressed');
                onPressed?.call();
              },
        style: ElevatedButton.styleFrom(
          backgroundColor: bg,
          foregroundColor: fg,
          elevation: variant == ButtonVariant.primary ? 1.5 : 0,
          shadowColor: AppColors.frenchNavy.withValues(alpha: 0.2),
          side: borderSide,
          padding: resolvedPadding,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(isCompact ? 8 : 10),
          ),
        ),
        child: isLoading
            ? SizedBox(
                width: isCompact ? 16 : 20,
                height: isCompact ? 16 : 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2.0,
                  valueColor: AlwaysStoppedAnimation<Color>(fg),
                ),
              )
            : Row(
                mainAxisSize: MainAxisSize.min,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (icon != null) ...[
                    Icon(icon, size: isCompact ? 16 : 18, color: fg),
                    const SizedBox(width: 6),
                  ],
                  Flexible(
                    child: Text(
                      text,
                      style: textStyle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
