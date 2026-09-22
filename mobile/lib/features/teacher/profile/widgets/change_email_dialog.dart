import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/app_locale_notifier.dart';

class ChangeEmailDialog extends ConsumerStatefulWidget {
  final String currentEmail;
  final VoidCallback onSuccess;

  const ChangeEmailDialog({
    super.key,
    required this.currentEmail,
    required this.onSuccess,
  });

  static Future<void> show({
    required BuildContext context,
    required String currentEmail,
    required VoidCallback onSuccess,
  }) {
    return showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 460),
          child: ChangeEmailDialog(
            currentEmail: currentEmail,
            onSuccess: onSuccess,
          ),
        ),
      ),
    );
  }

  @override
  ConsumerState<ChangeEmailDialog> createState() => _ChangeEmailDialogState();
}

class _ChangeEmailDialogState extends ConsumerState<ChangeEmailDialog> {
  final _emailCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();

  String _step = 'email'; // 'email' or 'code'
  bool _isLoading = false;
  String? _error;
  String? _expiresAt;
  int? _attemptsLeft;
  Timer? _timer;
  int _secondsRemaining = 600;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _codeCtrl.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startCountdown(String? expiresAtStr) {
    _timer?.cancel();
    if (expiresAtStr == null) return;
    try {
      final expiry = DateTime.parse(expiresAtStr);
      _secondsRemaining = expiry.difference(DateTime.now()).inSeconds.clamp(0, 600);
    } catch (_) {
      _secondsRemaining = 600;
    }

    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) {
        t.cancel();
        return;
      }
      if (_secondsRemaining > 0) {
        setState(() => _secondsRemaining--);
      } else {
        t.cancel();
      }
    });
  }

  Future<void> _requestChange() async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    final email = _emailCtrl.text.trim();

    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
      setState(() => _error = isFr ? 'Entrez une adresse e-mail valide' : 'Please enter a valid email');
      return;
    }
    if (email.toLowerCase() == widget.currentEmail.toLowerCase()) {
      setState(() => _error = isFr ? 'La nouvelle adresse doit être différente' : 'New email must be different from current email');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.post('/email-change/request', data: {'newEmail': email});
      if (res.data != null && res.data['success'] == true) {
        setState(() {
          _step = 'code';
          _isLoading = false;
          _expiresAt = res.data['expiresAt'];
          _attemptsLeft = res.data['attemptsLeft'] ?? 3;
        });
        _startCountdown(_expiresAt);
      } else {
        setState(() {
          _isLoading = false;
          _error = res.data?['error'] ?? (isFr ? 'Échec de la demande' : 'Failed to start email change');
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = e.toString().contains('409')
            ? (isFr ? 'Cet e-mail est déjà associé à un autre compte.' : 'This email is already in use by another account.')
            : (isFr ? 'Une erreur est survenue lors de l\'envoi du code.' : 'An error occurred while sending the code.');
      });
    }
  }

  Future<void> _verifyChange() async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    final code = _codeCtrl.text.trim().replaceAll(RegExp(r'\D'), '');

    if (code.length != 6) {
      setState(() => _error = isFr ? 'Le code doit contenir 6 chiffres' : 'Code must be 6 digits');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final client = ref.read(apiClientProvider);
      final res = await client.post('/email-change/verify', data: {'code': code});
      if (res.data != null && res.data['success'] == true) {
        await ref.read(authNotifierProvider.notifier).fetchProfile();
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: AppColors.good,
            content: Text(
              isFr ? 'Adresse e-mail modifiée avec succès' : 'Email address updated successfully',
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600),
            ),
          ),
        );
        widget.onSuccess();
        Navigator.pop(context);
      } else {
        setState(() {
          _isLoading = false;
          _error = res.data?['error'] ?? (isFr ? 'Code invalide' : 'Invalid code');
          if (res.data?['attemptsLeft'] != null) {
            _attemptsLeft = res.data['attemptsLeft'];
          }
        });
      }
    } catch (e) {
      setState(() {
        _isLoading = false;
        _error = isFr ? 'Code invalide ou expiré' : 'Invalid or expired code';
      });
    }
  }

  Future<void> _resendCode() async {
    final isFr = ref.read(appLocaleProvider).languageCode == 'fr';
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.post('/email-change/resend');
      if (res.data != null && res.data['success'] == true) {
        _startCountdown(res.data['expiresAt']);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              backgroundColor: const Color(0xFF4F46E5),
              content: Text(
                isFr ? 'Nouveau code envoyé par e-mail' : 'New code sent to your email',
              ),
            ),
          );
        }
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final isFr = ref.watch(appLocaleProvider).languageCode == 'fr';

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
                  Icons.mail_outline,
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
                      _step == 'email'
                          ? (isFr ? 'Changer d\'adresse e-mail' : 'Change email address')
                          : (isFr ? 'Vérifier la nouvelle adresse' : 'Verify new email'),
                      style: AppTypography.titleMedium.copyWith(
                        fontWeight: FontWeight.w700,
                        color: AppColors.ink,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      _step == 'email'
                          ? (isFr
                              ? 'Un code de confirmation sera envoyé à la nouvelle adresse.'
                              : 'A confirmation code will be sent to the new address.')
                          : (isFr
                              ? 'Entrez le code envoyé à ${_emailCtrl.text}.'
                              : 'Enter the code sent to ${_emailCtrl.text}.'),
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

          if (_step == 'email') ...[
            Text(
              isFr ? 'Nouvelle adresse e-mail' : 'New email address',
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _emailCtrl,
              keyboardType: TextInputType.emailAddress,
              autofocus: true,
              decoration: InputDecoration(
                hintText: 'exemple@domaine.com',
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
              ),
            ),
            const SizedBox(height: 22),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: _isLoading ? null : () => Navigator.pop(context),
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
                  onPressed: _isLoading ? null : _requestChange,
                  child: _isLoading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation(Colors.white),
                          ),
                        )
                      : Text(
                          isFr ? 'Envoyer le code' : 'Send code',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                ),
              ],
            ),
          ] else ...[
            Text(
              isFr ? 'Code de confirmation (6 chiffres)' : 'Confirmation code (6 digits)',
              style: AppTypography.bodySmall.copyWith(
                fontWeight: FontWeight.w600,
                color: AppColors.ink,
              ),
            ),
            const SizedBox(height: 6),
            TextField(
              controller: _codeCtrl,
              keyboardType: TextInputType.number,
              autofocus: true,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: const TextStyle(
                fontSize: 22,
                letterSpacing: 8,
                fontWeight: FontWeight.w700,
              ),
              decoration: InputDecoration(
                hintText: '••••••',
                counterText: '',
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
              ),
            ),
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  isFr
                      ? 'Expire dans : ${(_secondsRemaining ~/ 60).toString().padLeft(2, '0')}:${(_secondsRemaining % 60).toString().padLeft(2, '0')}'
                      : 'Expires in: ${(_secondsRemaining ~/ 60).toString().padLeft(2, '0')}:${(_secondsRemaining % 60).toString().padLeft(2, '0')}',
                  style: AppTypography.caption.copyWith(
                    color: _secondsRemaining < 60 ? AppColors.bad : AppColors.textMuted,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                TextButton(
                  onPressed: _secondsRemaining < 540 ? _resendCode : null,
                  child: Text(
                    isFr ? 'Renvoyer le code' : 'Resend code',
                    style: const TextStyle(fontSize: 12),
                  ),
                ),
              ],
            ),
            if (_attemptsLeft != null && _attemptsLeft! < 3) ...[
              const SizedBox(height: 4),
              Text(
                isFr
                    ? '$_attemptsLeft tentative(s) restante(s)'
                    : '$_attemptsLeft attempt(s) remaining',
                style: const TextStyle(
                  color: AppColors.bad,
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
            const SizedBox(height: 18),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                TextButton(
                  onPressed: _isLoading ? null : () => setState(() => _step = 'email'),
                  child: Text(
                    isFr ? 'Retour' : 'Back',
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
                  onPressed: _isLoading ? null : _verifyChange,
                  child: _isLoading
                      ? const SizedBox(
                          width: 16,
                          height: 16,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation(Colors.white),
                          ),
                        )
                      : Text(
                          isFr ? 'Confirmer' : 'Confirm',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
