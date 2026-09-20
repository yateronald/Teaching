import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/brand_logo.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../../../auth/screens/welcome_screen.dart';

class ProfileSettingsScreen extends ConsumerStatefulWidget {
  const ProfileSettingsScreen({super.key});

  @override
  ConsumerState<ProfileSettingsScreen> createState() => _ProfileSettingsScreenState();
}

class _ProfileSettingsScreenState extends ConsumerState<ProfileSettingsScreen> {
  final _oldPassCtrl = TextEditingController();
  final _newPassCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();

  bool _isSavingPass = false;
  String? _passError;
  String? _passSuccess;

  @override
  void dispose() {
    _oldPassCtrl.dispose();
    _newPassCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  Future<void> _changePassword() async {
    final oldP = _oldPassCtrl.text.trim();
    final newP = _newPassCtrl.text.trim();
    final confP = _confirmPassCtrl.text.trim();

    if (oldP.isEmpty || newP.isEmpty || confP.isEmpty) {
      setState(() => _passError = 'Veuillez remplir tous les champs de mot de passe.');
      return;
    }

    if (newP != confP) {
      setState(() => _passError = 'Le nouveau mot de passe et sa confirmation ne concordent pas.');
      return;
    }

    if (newP.length < 6) {
      setState(() => _passError = 'Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setState(() {
      _isSavingPass = true;
      _passError = null;
      _passSuccess = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      await client.post('/auth/change-password', data: {
        'oldPassword': oldP,
        'newPassword': newP,
      });

      if (mounted) {
        setState(() {
          _isSavingPass = false;
          _passSuccess = 'Votre mot de passe a été modifié avec succès.';
          _oldPassCtrl.clear();
          _newPassCtrl.clear();
          _confirmPassCtrl.clear();
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _isSavingPass = false;
          _passError = 'Échec de la modification. Vérifiez votre mot de passe actuel.';
        });
      }
    }
  }

  Future<void> _logout() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Déconnexion'),
        content: const Text('Souhaitez-vous vraiment vous déconnecter de l\'application ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.bad,
              foregroundColor: AppColors.pureWhite,
            ),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Se déconnecter'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      await ref.read(authNotifierProvider.notifier).logout();
      if (mounted) {
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (context) => const WelcomeScreen()),
          (route) => false,
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = ref.watch(authNotifierProvider).user;
    final isTablet = MediaQuery.of(context).size.width >= 768;

    return SingleChildScrollView(
      padding: EdgeInsets.symmetric(
        horizontal: isTablet ? 32 : 16,
        vertical: 24,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Text(
            'Profil & Paramètres',
            style: AppTypography.headlineMedium.copyWith(
              fontWeight: FontWeight.w700,
              color: AppColors.frenchNavy,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Gérez vos identifiants enseignants, votre sécurité et vos préférences pédagogiques.',
            style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
          ),
          const SizedBox(height: 24),

          // Teacher Info Card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.pureWhite,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border, width: 1.1),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 36,
                  backgroundColor: AppColors.frenchNavy,
                  foregroundColor: AppColors.pureWhite,
                  child: Text(
                    user?.fullName.isNotEmpty == true ? user!.fullName[0].toUpperCase() : 'P',
                    style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 18),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: AppColors.teacherRoseBg,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.teacherDot.withValues(alpha: 0.3)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  width: 6,
                                  height: 6,
                                  decoration: const BoxDecoration(
                                    color: AppColors.teacherDot,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Professeur de Français',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.teacherDot,
                                    fontWeight: FontWeight.w700,
                                    fontSize: 10,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        user?.fullName ?? 'Professeur',
                        style: AppTypography.titleLarge.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        user?.email ?? '',
                        style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Security & Password Change
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppColors.pureWhite,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border, width: 1.1),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    const Icon(Icons.lock_outline, color: AppColors.frenchNavy, size: 22),
                    const SizedBox(width: 10),
                    Text(
                      'Sécurité du Compte',
                      style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  'Modifiez votre mot de passe pour garantir la sécurité de vos données de cours.',
                  style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
                ),
                const SizedBox(height: 20),

                if (_passError != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.badBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.badBorder),
                    ),
                    child: Text(_passError!, style: AppTypography.caption.copyWith(color: AppColors.bad, fontWeight: FontWeight.w600)),
                  ),
                  const SizedBox(height: 14),
                ],
                if (_passSuccess != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.goodBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.goodBorder),
                    ),
                    child: Text(_passSuccess!, style: AppTypography.caption.copyWith(color: AppColors.good, fontWeight: FontWeight.w600)),
                  ),
                  const SizedBox(height: 14),
                ],

                CustomTextField(
                  label: 'Mot de passe actuel',
                  hintText: '••••••••',
                  controller: _oldPassCtrl,
                  isPassword: true,
                ),
                const SizedBox(height: 14),
                CustomTextField(
                  label: 'Nouveau mot de passe',
                  hintText: 'Minimum 6 caractères',
                  controller: _newPassCtrl,
                  isPassword: true,
                ),
                const SizedBox(height: 14),
                CustomTextField(
                  label: 'Confirmer le nouveau mot de passe',
                  hintText: '••••••••',
                  controller: _confirmPassCtrl,
                  isPassword: true,
                ),
                const SizedBox(height: 20),

                CustomButton(
                  text: 'Mettre à jour le mot de passe',
                  icon: Icons.vpn_key_outlined,
                  isLoading: _isSavingPass,
                  height: 48,
                  onPressed: _changePassword,
                ),
              ],
            ),
          ),
          // About & Version Card with Official Brand Logo
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(22),
            decoration: BoxDecoration(
              color: AppColors.pureWhite,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border, width: 1.1),
            ),
            child: Column(
              children: [
                const BrandLogo(height: 52, tight: true),
                const SizedBox(height: 12),
                Text(
                  'Learn French with Natives',
                  style: AppTypography.titleSmall.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.frenchNavy,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Application Enseignant · Version 1.0.0 (Build 1)',
                  style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                ),
                const SizedBox(height: 8),
                Text(
                  '© 2026 Learn French with Natives. Tous droits réservés.',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.textSubtle,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),

          // Logout Action
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.pureWhite,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.border, width: 1.1),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Session Enseignant',
                      style: AppTypography.bodyMedium.copyWith(fontWeight: FontWeight.w700, color: AppColors.ink),
                    ),
                    Text(
                      'Fermer la session sur cet appareil.',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
                CustomButton(
                  text: 'Déconnexion',
                  icon: Icons.logout,
                  variant: ButtonVariant.danger,
                  height: 42,
                  onPressed: _logout,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
