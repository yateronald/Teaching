import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/auth/app_lock.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/app_locale_notifier.dart';
import '../../../core/widgets/tricolore_bar.dart';

/// Covers the whole app while it is locked. Asks for the fingerprint as soon
/// as it appears; the password remains a way in.
class AppLockScreen extends ConsumerStatefulWidget {
  const AppLockScreen({super.key});

  @override
  ConsumerState<AppLockScreen> createState() => _AppLockScreenState();
}

class _AppLockScreenState extends ConsumerState<AppLockScreen> {
  bool _failed = false;
  bool _busy = false;

  bool get _isFr => ref.read(appLocaleProvider).languageCode == 'fr';

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => _unlock());
  }

  Future<void> _unlock() async {
    if (_busy || !mounted) return;
    setState(() => _busy = true);
    final ok = await ref.read(appLockProvider).unlock(
          _isFr
              ? 'Déverrouillez Learn French with Natives'
              : 'Unlock Learn French with Natives',
        );
    if (!mounted) return;
    setState(() {
      _busy = false;
      _failed = !ok;
    });
  }

  Future<void> _usePassword() async {
    // Signing out is the way back to the password screen.
    await ref.read(authNotifierProvider.notifier).logout();
  }

  @override
  Widget build(BuildContext context) {
    final isFr = ref.watch(appLocaleProvider).languageCode == 'fr';
    final user = ref.watch(authNotifierProvider).user;
    final name = user?.firstName.isNotEmpty == true ? user!.firstName : null;

    return Material(
      color: AppColors.frenchPaper,
      child: SafeArea(
        child: Column(
          children: [
            const TricoloreBar(height: 4),
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.border),
                        ),
                        child: const Icon(Icons.school, size: 40, color: AppColors.frenchNavy),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        name == null
                            ? 'Learn French with Natives'
                            : (isFr ? 'Bonjour, $name' : 'Welcome back, $name'),
                        textAlign: TextAlign.center,
                        style: AppTypography.displayMedium.copyWith(
                          fontSize: 22,
                          color: AppColors.frenchNavy,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        isFr
                            ? 'L\'application est verrouillée. Utilisez votre empreinte pour continuer.'
                            : 'The app is locked. Use your fingerprint to continue.',
                        textAlign: TextAlign.center,
                        style: AppTypography.bodyMedium.copyWith(color: AppColors.textMuted),
                      ),
                      const SizedBox(height: 36),
                      Semantics(
                        button: true,
                        label: isFr ? 'Déverrouiller' : 'Unlock',
                        child: InkWell(
                          onTap: _busy ? null : _unlock,
                          customBorder: const CircleBorder(),
                          child: Container(
                            width: 88,
                            height: 88,
                            decoration: BoxDecoration(
                              color: AppColors.frenchNavy.withValues(alpha: 0.08),
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: _failed ? AppColors.bad : AppColors.frenchNavy,
                                width: 1.5,
                              ),
                            ),
                            child: Icon(
                              Icons.fingerprint,
                              size: 48,
                              color: _failed ? AppColors.bad : AppColors.frenchNavy,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        _failed
                            ? (isFr ? 'Non reconnu. Touchez pour réessayer.' : 'Not recognised. Tap to try again.')
                            : (isFr ? 'Touchez pour déverrouiller' : 'Tap to unlock'),
                        style: AppTypography.caption.copyWith(
                          color: _failed ? AppColors.bad : AppColors.textMuted,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: TextButton(
                onPressed: _busy ? null : _usePassword,
                child: Text(
                  isFr ? 'Se connecter avec le mot de passe' : 'Sign in with your password instead',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
