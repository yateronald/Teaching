import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'core/auth/app_lock.dart';
import 'core/auth/auth_notifier.dart';
import 'core/constants/app_colors.dart';
import 'core/constants/app_typography.dart';
import 'core/theme/app_theme.dart';
import 'core/widgets/tricolore_bar.dart';
import 'features/auth/screens/app_lock_screen.dart';
import 'features/auth/screens/welcome_screen.dart';
import 'features/admin/shell/admin_shell.dart';
import 'features/teacher/shell/teacher_shell.dart';

import 'core/localization/app_locale_notifier.dart';
import 'core/navigation/app_navigation.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  authGateBuilder = (_) => const AuthGate();
  // Initialize date formatting for both supported locales
  final results = await Future.wait([
    SharedPreferences.getInstance(),
    initializeDateFormatting('fr_FR', null),
    initializeDateFormatting('en_US', null),
  ]);
  runApp(
    ProviderScope(
      overrides: [
        sharedPreferencesProvider.overrideWithValue(
          results.first as SharedPreferences,
        ),
      ],
      child: const LearnFrenchTeacherApp(),
    ),
  );
}


class LearnFrenchTeacherApp extends ConsumerWidget {
  const LearnFrenchTeacherApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentLocale = ref.watch(appLocaleProvider);

    ref.listen<AuthState>(authNotifierProvider, (previous, next) {
      final wasIn = previous?.isAuthenticated == true;
      final isIn = next.isAuthenticated && next.user != null;
      final lock = ref.read(appLockProvider);
      if (isIn && (!wasIn || previous?.user?.id != next.user!.id)) {
        lock.signedIn('${next.user!.id}', restored: next.restored);
      } else if (wasIn && !next.isAuthenticated) {
        // Signed out here, on another device, or the session ended.
        lock.signedOut();
        showAuthGate();
        if (next.errorMessage != null) {
          final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
          appMessengerKey.currentState?.showSnackBar(
            SnackBar(
              behavior: SnackBarBehavior.floating,
              duration: const Duration(seconds: 6),
              content: Text(
                isFr
                    ? 'Votre session a pris fin sur cet appareil. Veuillez vous reconnecter.'
                    : 'Your session on this device has ended. Please sign in again.',
              ),
            ),
          );
        }
      }
    });

    return MaterialApp(
      navigatorKey: appNavigatorKey,
      scaffoldMessengerKey: appMessengerKey,
      title: 'Learn French with Natives – Teacher Space',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      locale: currentLocale,
      localizationsDelegates: const [
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [Locale('fr', 'FR'), Locale('en', 'US')],
      home: const AuthGate(),
      // Above every screen and dialog, so nothing shows through the lock.
      builder: (context, child) => Consumer(
        builder: (context, ref, _) {
          final locked = ref.watch(appLockProvider.select((l) => l.isLocked));
          return Stack(
            children: [
              ?child,
              if (locked) const Positioned.fill(child: AppLockScreen()),
            ],
          );
        },
      ),
    );
  }
}

class AuthGate extends ConsumerWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authNotifierProvider);

    if (authState.isLoading) {
      return Scaffold(
        backgroundColor: AppColors.frenchPaper,
        body: SafeArea(
          child: Column(
            children: [
              const TricoloreBar(height: 4),
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: AppColors.pureWhite,
                          shape: BoxShape.circle,
                          border: Border.all(color: AppColors.border),
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.04),
                              blurRadius: 16,
                              offset: const Offset(0, 4),
                            ),
                          ],
                        ),
                        child: const Icon(Icons.school, size: 48, color: AppColors.frenchNavy),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Learn French with Natives',
                        style: AppTypography.displayMedium.copyWith(
                          fontSize: 22,
                          color: AppColors.frenchNavy,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Espace Enseignant · Faculté Pédagogique',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.teacherDot,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.5,
                        ),
                      ),
                      const SizedBox(height: 32),
                      const SizedBox(
                        width: 28,
                        height: 28,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: AppColors.frenchNavy,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }

    if (authState.isAuthenticated && authState.user != null) {
      // Each role opens its own space; the key rebuilds it for another account.
      final user = authState.user!;
      return user.isAdmin
          ? AdminShell(key: ValueKey('admin-${user.id}'))
          : TeacherShell(key: ValueKey('teacher-${user.id}'));
    }

    return const WelcomeScreen();
  }
}
