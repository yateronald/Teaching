import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/auth/app_lock.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/app_locale_notifier.dart';

/// After the first password sign-in on this phone, proposes fingerprint
/// unlock once. The answer can be changed later in Profile › Security.
Future<void> offerAppLock(BuildContext context, WidgetRef ref) async {
  final lock = ref.read(appLockProvider);
  if (!await lock.shouldOffer() || !context.mounted) return;
  await lock.markOffered();
  if (!context.mounted) return;

  final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
  final enable = await showDialog<bool>(
    context: context,
    barrierDismissible: false,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
      icon: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: AppColors.frenchNavy.withValues(alpha: 0.08),
          shape: BoxShape.circle,
        ),
        child: const Icon(Icons.fingerprint, size: 36, color: AppColors.frenchNavy),
      ),
      title: Text(
        isFr ? 'Activer l\'empreinte digitale ?' : 'Use your fingerprint?',
        textAlign: TextAlign.center,
      ),
      content: Text(
        isFr
            ? 'Vous restez connecté sur ce téléphone pendant 6 mois. Protégez l\'accès '
                  'à l\'application avec votre empreinte : elle vous sera demandée à '
                  'chaque ouverture.\n\nVous pourrez changer ce choix dans Profil › Sécurité.'
            : 'You stay signed in on this phone for 6 months. Protect the app with your '
                  'fingerprint: it will be asked each time you open it.\n\nYou can change '
                  'this later in Profile › Security.',
        textAlign: TextAlign.center,
        style: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted, height: 1.4),
      ),
      actionsAlignment: MainAxisAlignment.center,
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: Text(isFr ? 'Plus tard' : 'Not now'),
        ),
        ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.frenchNavy,
            foregroundColor: AppColors.pureWhite,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          onPressed: () => Navigator.pop(context, true),
          icon: const Icon(Icons.fingerprint, size: 18),
          label: Text(isFr ? 'Activer' : 'Turn on'),
        ),
      ],
    ),
  );
  if (enable != true) return;

  final ok = await lock.enable(
    isFr ? 'Confirmez votre empreinte pour l\'activer' : 'Confirm your fingerprint to turn it on',
  );
  if (!context.mounted) return;
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      behavior: SnackBarBehavior.floating,
      backgroundColor: ok ? AppColors.good : AppColors.bad,
      content: Text(
        ok
            ? (isFr ? 'Déverrouillage par empreinte activé.' : 'Fingerprint unlock is on.')
            : (isFr
                  ? 'Empreinte non confirmée. Vous pourrez l\'activer dans Profil › Sécurité.'
                  : 'Fingerprint not confirmed. You can turn it on in Profile › Security.'),
      ),
    ),
  );
}
