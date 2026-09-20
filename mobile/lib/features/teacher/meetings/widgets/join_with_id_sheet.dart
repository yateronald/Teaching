import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/api/api_error.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';
import '../../../../core/widgets/custom_text_field.dart';
import '../screens/pre_join_screen.dart';

class JoinWithIdSheet extends ConsumerStatefulWidget {
  const JoinWithIdSheet({super.key});

  @override
  ConsumerState<JoinWithIdSheet> createState() => _JoinWithIdSheetState();
}

class _JoinWithIdSheetState extends ConsumerState<JoinWithIdSheet> {
  final _idCtrl = TextEditingController();
  final _passcodeCtrl = TextEditingController();
  bool _isLoading = false;
  String? _errorMessage;

  @override
  void dispose() {
    _idCtrl.dispose();
    _passcodeCtrl.dispose();
    super.dispose();
  }

  void _onIdChanged(String raw) {
    // Check if the user pasted a complete invite link with passcode
    final pwdMatch = RegExp(r'[#&?]pwd=([A-Za-z0-9]{4,12})').firstMatch(raw);
    if (pwdMatch != null) {
      final extractedPass = pwdMatch.group(1)?.toUpperCase() ?? '';
      _passcodeCtrl.text = extractedPass;
    }

    // Extract meeting ID from full URL if pasted
    String cleaned = raw.trim();
    if (cleaned.contains('/meeting/')) {
      final parts = cleaned.split('/meeting/');
      if (parts.length > 1) {
        cleaned = parts[1].split(RegExp(r'[#&?]')).first;
      }
    } else if (cleaned.contains('#')) {
      cleaned = cleaned.split('#').first;
    }

    if (cleaned != raw) {
      _idCtrl.text = cleaned;
      _idCtrl.selection = TextSelection.fromPosition(TextPosition(offset: cleaned.length));
    }

    if (_errorMessage != null) {
      setState(() => _errorMessage = null);
    }
  }

  Future<void> _submit() async {
    final meetingId = _idCtrl.text.trim().toLowerCase();
    final passcode = _passcodeCtrl.text.trim().toUpperCase();

    if (meetingId.isEmpty) {
      setState(() => _errorMessage = 'Veuillez renseigner l\'identifiant de réunion.');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final client = ref.read(apiClientProvider);

      // Verify the ID and passcode against backend
      final verifyRes = await client.post('/meetings/verify', data: {
        'meetingId': meetingId,
        if (passcode.isNotEmpty) 'passcode': passcode,
      });

      final verifiedData = verifyRes.data as Map<String, dynamic>?;
      final roomCode = verifiedData?['code'] ?? meetingId;

      // Fetch meeting details using room code
      Map<String, dynamic> meetingDetails;
      try {
        final detailsRes = await client.get('/meetings/$roomCode');
        meetingDetails = detailsRes.data as Map<String, dynamic>;
      } catch (_) {
        meetingDetails = {
          'id': roomCode,
          'room_name': roomCode,
          'title': verifiedData?['title'] ?? 'Classe Virtuelle',
          'status': verifiedData?['status'] ?? 'active',
        };
      }

      if (!mounted) return;
      Navigator.pop(context); // Close sheet

      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => PreJoinScreen(
            meeting: meetingDetails,
            passcode: passcode.isNotEmpty ? passcode : null,
          ),
        ),
      );
    } on ApiException catch (e) {
      if (mounted) {
        String msg = e.message;
        if (e.statusCode == 404) {
          msg = 'Aucune réunion ne correspond à cet identifiant. Vérifiez le code.';
        } else if (e.statusCode == 403) {
          if (msg.toLowerCase().contains('passcode')) {
            msg = 'Code secret erroné. Veuillez vérifier l\'invitation.';
          } else if (msg.toLowerCase().contains('removed') || msg.toLowerCase().contains('kicked')) {
            msg = 'L\'hôte vous a exclu de cette réunion.';
          }
        } else if (e.statusCode == 410) {
          msg = 'Cette réunion est déjà terminée.';
        } else if (e.statusCode == 429) {
          msg = 'Trop de tentatives infructueuses. Réessayez dans quelques minutes.';
        }
        setState(() {
          _errorMessage = msg;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _errorMessage = 'Impossible de vérifier la réunion. Vérifiez votre connexion.';
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.only(
        left: 24,
        right: 24,
        top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 28,
      ),
      decoration: const BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Handle bar
            Center(
              child: Container(
                width: 44,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.border,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Header with icon
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(
                    color: AppColors.frenchNavy.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.tag, color: AppColors.frenchNavy, size: 24),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'REJOINDRE UNE CLASSE',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.frenchNavy,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.1,
                        ),
                      ),
                      Text(
                        'Saisir l\'identifiant de réunion',
                        style: AppTypography.titleMedium.copyWith(
                          fontWeight: FontWeight.w700,
                          color: AppColors.ink,
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Text(
              'Entrez l\'ID de réunion ou collez directement le lien d\'invitation reçu.',
              style: AppTypography.bodySmall.copyWith(color: AppColors.textMuted),
            ),
            const SizedBox(height: 20),

            // Error banner
            if (_errorMessage != null) ...[
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: AppColors.badBg,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.bad.withValues(alpha: 0.3)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.error_outline, color: AppColors.bad, size: 20),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        _errorMessage!,
                        style: AppTypography.caption.copyWith(
                          color: AppColors.bad,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
            ],

            // Meeting ID Input
            CustomTextField(
              label: 'Identifiant de réunion (Meeting ID)',
              hintText: 'ex: abc-defg-hij ou collez le lien...',
              controller: _idCtrl,
              prefixIcon: Icons.videocam_outlined,
              onChanged: _onIdChanged,
            ),
            const SizedBox(height: 4),
            Text(
              'Format habituel : 3 lettres - 4 lettres - 3 lettres (ex: xyz-abcd-efg)',
              style: AppTypography.caption.copyWith(
                fontSize: 11,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 16),

            // Passcode Input
            CustomTextField(
              label: 'Code secret (Passcode)',
              hintText: 'ex: 6 caractères (W8K2P9)',
              controller: _passcodeCtrl,
              prefixIcon: Icons.lock_outline,
            ),
            const SizedBox(height: 4),
            Text(
              'Requis pour les participants externes ou hors-promotion. Insensible à la casse.',
              style: AppTypography.caption.copyWith(
                fontSize: 11,
                color: AppColors.textMuted,
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            CustomButton(
              text: 'Vérifier & Rejoindre la classe',
              icon: Icons.login,
              isLoading: _isLoading,
              onPressed: _submit,
            ),
          ],
        ),
      ),
    );
  }
}
