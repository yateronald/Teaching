import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/auth/auth_notifier.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/constants/app_typography.dart';
import '../../../core/localization/translations.dart';
import '../../../core/widgets/brand_logo.dart';
import '../../../core/widgets/custom_button.dart';
import '../../../core/widgets/custom_text_field.dart';
import '../../../core/widgets/language_switcher_button.dart';
import '../../../core/widgets/tricolore_bar.dart';
import '../../teacher/shell/teacher_shell.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _rememberMe = true;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    debugPrint('_handleLogin CALLED: email="${_emailController.text}", pwdLen=${_passwordController.text.length}');
    if (!_formKey.currentState!.validate()) {
      debugPrint('_handleLogin: form validation failed!');
      return;
    }

    setState(() => _errorMessage = null);

    final success = await ref.read(authNotifierProvider.notifier).login(
          _emailController.text.trim(),
          _passwordController.text.trim(),
        );

    if (!mounted) return;

    if (success) {
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (context) => const TeacherShell()),
        (route) => false,
      );
    } else {
      final authState = ref.read(authNotifierProvider);
      setState(() {
        _errorMessage = authState.errorMessage ?? 'Identifiants invalides ou rôle non autorisé.';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isTablet = MediaQuery.of(context).size.width >= 720;
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      backgroundColor: AppColors.frenchPaper,
      body: SafeArea(
        child: Column(
          children: [
            const TricoloreBar(height: 4),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  IconButton(
                    icon: const Icon(Icons.arrow_back, color: AppColors.frenchNavy),
                    tooltip: context.isFrench ? 'Retour' : 'Back',
                    onPressed: () => Navigator.maybePop(context),
                  ),
                  const LanguageSwitcherButton(),
                ],
              ),
            ),
            Expanded(
              child: isTablet
                  ? _buildTabletSplitLayout(authState.isLoading)
                  : _buildMobileLayout(authState.isLoading),
            ),
          ],
        ),
      ),
    );
  }

  /// Tablet Split-Screen: Left Editorial Dark Brand Banner, Right Elevated Card
  Widget _buildTabletSplitLayout(bool isLoading) {
    return Row(
      children: [
        // Left Editorial Brand Hero
        Expanded(
          flex: 5,
          child: Container(
            color: AppColors.frenchNavyDark,
            padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 64),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                      decoration: BoxDecoration(
                        color: AppColors.pureWhite,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withValues(alpha: 0.15),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: const BrandLogo(height: 48, tight: true),
                    ),
                    const SizedBox(height: 24),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.pureWhite.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'FACULTÉ PÉDAGOGIQUE',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.frenchGold,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.5,
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),
                    Text(
                      '« Enseigner, c’est éveiller la curiosité et transmettre l’élégance d’une langue. »',
                      style: AppTypography.displayMedium.copyWith(
                        color: AppColors.pureWhite,
                        fontSize: 28,
                        height: 1.35,
                        fontStyle: FontStyle.italic,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      'Learn French with Natives',
                      style: AppTypography.titleMedium.copyWith(
                        color: AppColors.pureWhite.withValues(alpha: 0.7),
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildPillarItem(
                      Icons.verified_user_outlined,
                      'Espace Enseignant Sécurisé',
                      'Accès crypté JWT & conformité pédagogique CECRL.',
                    ),
                    const SizedBox(height: 20),
                    _buildPillarItem(
                      Icons.analytics_outlined,
                      'Suivi Précis & Résultats en Direct',
                      'Visualisation détaillée des 4 compétences TCF/TEF.',
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Right Elevated Form Pane
        Expanded(
          flex: 6,
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 32),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 480),
                child: _buildFormCard(isLoading),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPillarItem(IconData icon, String title, String desc) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: AppColors.frenchGold, size: 22),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTypography.bodyMedium.copyWith(
                  color: AppColors.pureWhite,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 2),
              Text(
                desc,
                style: AppTypography.caption.copyWith(
                  color: AppColors.pureWhite.withValues(alpha: 0.65),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  /// Mobile Single-Column Layout
  Widget _buildMobileLayout(bool isLoading) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 440),
          child: _buildFormCard(isLoading),
        ),
      ),
    );
  }

  /// Form card shared between Phone and Tablet
  Widget _buildFormCard(bool isLoading) {
    return Container(
      padding: const EdgeInsets.all(28),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.border, width: 1.2),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Center(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 20),
                child: const BrandLogo(
                  height: 60,
                  tight: true,
                  heroTag: 'brand_logo',
                ),
              ),
            ),
            Row(
              children: [
                Container(
                  width: 10,
                  height: 10,
                  decoration: const BoxDecoration(
                    color: AppColors.teacherDot,
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  context.tr('teacher_space').toUpperCase(),
                  style: AppTypography.caption.copyWith(
                    color: AppColors.teacherDot,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 1.0,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              context.tr('login'),
              style: AppTypography.headlineLarge.copyWith(
                color: AppColors.frenchNavy,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              context.tr('login_subtitle'),
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 24),

            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.badBg,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.badBorder),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, size: 20, color: AppColors.bad),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.bad,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
            ],

            // Email
            CustomTextField(
              label: context.tr('email'),
              hintText: 'professeur@learnfrench.com',
              prefixIcon: Icons.mail_outline,
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              validator: (val) {
                if (val == null || val.trim().isEmpty) {
                  return context.isFrench ? 'Veuillez saisir votre adresse e-mail.' : 'Please enter your email address.';
                }
                if (!val.contains('@') || !val.contains('.')) {
                  return context.isFrench ? 'Format d\'adresse e-mail invalide.' : 'Invalid email format.';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Password
            CustomTextField(
              label: context.tr('password'),
              hintText: '••••••••',
              prefixIcon: Icons.lock_outline,
              controller: _passwordController,
              isPassword: true,
              validator: (val) {
                if (val == null || val.isEmpty) {
                  return context.isFrench ? 'Veuillez renseigner votre mot de passe.' : 'Please enter your password.';
                }
                return null;
              },
            ),
            const SizedBox(height: 12),

            // Remember me
            Row(
              children: [
                SizedBox(
                  width: 24,
                  height: 24,
                  child: Checkbox(
                    value: _rememberMe,
                    activeColor: AppColors.frenchNavy,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                    onChanged: (val) => setState(() => _rememberMe = val ?? true),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  context.tr('remember_me'),
                  style: AppTypography.bodySmall.copyWith(color: AppColors.text),
                ),
              ],
            ),
            const SizedBox(height: 24),

            // Submit Button
            CustomButton(
              text: context.tr('login'),
              icon: Icons.login,
              height: 50,
              width: double.infinity,
              isLoading: isLoading,
              onPressed: _handleLogin,
            ),
            const SizedBox(height: 20),

            // Notice
            Center(
              child: Text(
                'Accès strict réservé aux enseignants & examinateurs accrédités.',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textSubtle,
                  fontStyle: FontStyle.italic,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
