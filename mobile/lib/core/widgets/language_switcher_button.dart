import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../constants/app_colors.dart';
import '../constants/app_typography.dart';
import '../localization/app_locale_notifier.dart';

class LanguageSwitcherButton extends ConsumerWidget {
  final bool dark;

  const LanguageSwitcherButton({super.key, this.dark = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentLocale = ref.watch(appLocaleProvider);
    final isFrench = currentLocale.languageCode == 'fr';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          ref.read(appLocaleProvider.notifier).toggleLocale();
        },
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
          decoration: BoxDecoration(
            color: dark ? Colors.white.withValues(alpha: 0.12) : AppColors.frenchPaper,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: dark ? Colors.white.withValues(alpha: 0.25) : AppColors.border,
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.language,
                size: 14,
                color: AppColors.frenchNavy,
              ),
              const SizedBox(width: 6),
              Text(
                'FR',
                style: AppTypography.caption.copyWith(
                  fontWeight: isFrench ? FontWeight.w800 : FontWeight.w500,
                  color: isFrench
                      ? (dark ? AppColors.frenchGold : AppColors.frenchNavy)
                      : (dark ? Colors.white54 : AppColors.textMuted),
                  fontSize: 11,
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: Text(
                  '|',
                  style: TextStyle(
                    fontSize: 11,
                    color: dark ? Colors.white24 : AppColors.border,
                  ),
                ),
              ),
              Text(
                'EN',
                style: AppTypography.caption.copyWith(
                  fontWeight: !isFrench ? FontWeight.w800 : FontWeight.w500,
                  color: !isFrench
                      ? (dark ? AppColors.frenchGold : AppColors.frenchNavy)
                      : (dark ? Colors.white54 : AppColors.textMuted),
                  fontSize: 11,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
