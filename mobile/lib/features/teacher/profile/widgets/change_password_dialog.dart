import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/app_locale_notifier.dart';

class ChangePasswordDialog extends ConsumerStatefulWidget {
  const ChangePasswordDialog({super.key});

  static Future<bool?> show(BuildContext context) {
    return showDialog<bool>(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 460),
          child: const ChangePasswordDialog(),
        ),
      ),
    );
  }

  @override
  ConsumerState<ChangePasswordDialog> createState() =>
      _ChangePasswordDialogState();
}

class _ChangePasswordDialogState extends ConsumerState<ChangePasswordDialog> {
  final _currentPassCtrl = TextEditingController();
  final _newPassCtrl = TextEditingController();
  final _confirmPassCtrl = TextEditingController();

  bool _obscureCurrent = true;
  bool _obscureNew = true;
  bool _obscureConfirm = true;

  bool _isSaving = false;
  String? _error;

  @override
  void dispose() {
    _currentPassCtrl.dispose();
    _newPassCtrl.dispose();
    _confirmPassCtrl.dispose();
    super.dispose();
  }

  int _calculateStrength(String pw) {
    if (pw.length < 6) return 0;
    int score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (RegExp(r'[a-z]').hasMatch(pw) && RegExp(r'[A-Z]').hasMatch(pw)) score++;
    if (RegExp(r'\d').hasMatch(pw) && RegExp(r'[^A-Za-z0-9]').hasMatch(pw)) score++;
    return score.clamp(1, 4);
  }

  Future<void> _submit() async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    final current = _currentPassCtrl.text.trim();
    final next = _newPassCtrl.text.trim();
    final confirm = _confirmPassCtrl.text.trim();

    if (current.isEmpty) {
      setState(() => _error = isFr ? 'Entrez votre mot de passe actuel' : 'Enter your current password');
      return;
    }
    if (next.length < 6) {
      setState(() => _error = isFr ? 'Au moins 6 caractères requis' : 'At least 6 characters required');
      return;
    }
    if (next == current) {
      setState(() => _error = isFr ? 'Choisissez un mot de passe différent de l\'actuel' : 'Choose a password different from the current one');
      return;
    }
    if (next != confirm) {
      setState(() => _error = isFr ? 'Les mots de passe ne correspondent pas' : 'The passwords do not match');
      return;
    }

    setState(() {
      _isSaving = true;
      _error = null;
    });

    final res = await ref.read(authNotifierProvider.notifier).changePassword(
          currentPassword: current,
          newPassword: next,
        );

    if (!mounted) return;

    if (res['success'] == true) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          backgroundColor: AppColors.good,
          content: Text(
            isFr ? 'Mot de passe mis à jour avec succès' : 'Password updated successfully',
            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
          ),
        ),
      );
      Navigator.pop(context, true);
    } else {
      setState(() {
        _isSaving = false;
        _error = res['error'] ?? (isFr ? 'Échec de la modification' : 'Failed to change password');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFr = ref.watch(appLocaleProvider).languageCode == 'fr';
    final newPw = _newPassCtrl.text;
    final strengthScore = newPw.isEmpty ? 0 : _calculateStrength(newPw);

    final strengthLabels = isFr
        ? ['Trop court', 'Faible', 'Moyen', 'Bon', 'Robuste']
        : ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

    final strengthColors = [
      AppColors.bad,
      const Color(0xFFF59E0B),
      const Color(0xFFEAB308),
      const Color(0xFF2563EB),
      AppColors.good,
    ];

    return SingleChildScrollView(
      padding: const EdgeInsets.all(22),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF2FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.lock_outline,
                  color: Color(0xFF4F46E5),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      isFr ? 'Modifier le mot de passe' : 'Change password',
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      isFr
                          ? 'Vous restez connecté ici ; vos autres appareils seront déconnectés.'
                          : 'You stay signed in here; your other devices are signed out.',
                      style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Error Banner
          if (_error != null) ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.badBg,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.badBorder),
              ),
              child: Text(
                _error!,
                style: AppTypography.caption.copyWith(
                  color: AppColors.bad,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
            const SizedBox(height: 14),
          ],

          // Current Password Field
          Text(
            isFr ? 'Mot de passe actuel' : 'Current password',
            style: AppTypography.bodySmall.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _currentPassCtrl,
            obscureText: _obscureCurrent,
            decoration: InputDecoration(
              hintText: '••••••••',
              filled: true,
              fillColor: AppColors.frenchPaper,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureCurrent ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                  size: 18,
                  color: AppColors.textMuted,
                ),
                onPressed: () => setState(() => _obscureCurrent = !_obscureCurrent),
              ),
            ),
          ),
          const SizedBox(height: 14),

          // New Password Field
          Text(
            isFr ? 'Nouveau mot de passe' : 'New password',
            style: AppTypography.bodySmall.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _newPassCtrl,
            obscureText: _obscureNew,
            onChanged: (_) => setState(() {}),
            decoration: InputDecoration(
              hintText: '••••••••',
              filled: true,
              fillColor: AppColors.frenchPaper,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureNew ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                  size: 18,
                  color: AppColors.textMuted,
                ),
                onPressed: () => setState(() => _obscureNew = !_obscureNew),
              ),
            ),
          ),

          // Strength Bar
          if (newPw.isNotEmpty) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                for (int i = 1; i <= 4; i++)
                  Expanded(
                    child: Container(
                      height: 4,
                      margin: EdgeInsets.only(right: i < 4 ? 4 : 0),
                      decoration: BoxDecoration(
                        color: strengthScore >= i
                            ? strengthColors[strengthScore]
                            : const Color(0xFFE2E8F0),
                        borderRadius: BorderRadius.circular(2),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              '${strengthLabels[strengthScore]}${strengthScore < 3 ? (isFr ? ' — mélangez majuscules, chiffres et symboles' : ' — longer, with mixed case and numbers is better') : ''}',
              style: AppTypography.caption.copyWith(
                color: strengthColors[strengthScore],
                fontWeight: FontWeight.w600,
                fontSize: 11.5,
              ),
            ),
          ] else ...[
            const SizedBox(height: 4),
            Text(
              isFr
                  ? 'Au moins 6 caractères. 12 ou plus avec symboles est idéal.'
                  : 'At least 6 characters. 12 or more with a mix of characters is best.',
              style: AppTypography.caption.copyWith(
                color: AppColors.textSubtle,
                fontSize: 11.5,
              ),
            ),
          ],
          const SizedBox(height: 14),

          // Confirm Password Field
          Text(
            isFr ? 'Confirmer le nouveau mot de passe' : 'Confirm new password',
            style: AppTypography.bodySmall.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.ink,
            ),
          ),
          const SizedBox(height: 6),
          TextField(
            controller: _confirmPassCtrl,
            obscureText: _obscureConfirm,
            decoration: InputDecoration(
              hintText: '••••••••',
              filled: true,
              fillColor: AppColors.frenchPaper,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              suffixIcon: IconButton(
                icon: Icon(
                  _obscureConfirm ? Icons.visibility_outlined : Icons.visibility_off_outlined,
                  size: 18,
                  color: AppColors.textMuted,
                ),
                onPressed: () => setState(() => _obscureConfirm = !_obscureConfirm),
              ),
            ),
          ),
          const SizedBox(height: 22),

          // Action Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: _isSaving ? null : () => Navigator.pop(context),
                child: Text(
                  isFr ? 'Annuler' : 'Cancel',
                  style: const TextStyle(color: AppColors.textMuted),
                ),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF4F46E5),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: _isSaving ? null : _submit,
                child: _isSaving
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation(Colors.white),
                        ),
                      )
                    : Text(
                        isFr ? 'Mettre à jour' : 'Update password',
                        style: const TextStyle(fontWeight: FontWeight.w600),
                      ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
