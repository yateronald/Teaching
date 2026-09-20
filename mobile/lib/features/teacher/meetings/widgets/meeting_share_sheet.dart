import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';

class MeetingShareSheet extends ConsumerStatefulWidget {
  final Map<String, dynamic> meeting;
  final bool isCreated;
  final Function(String newPasscode)? onPasscodeChanged;

  const MeetingShareSheet({
    super.key,
    required this.meeting,
    this.isCreated = false,
    this.onPasscodeChanged,
  });

  @override
  ConsumerState<MeetingShareSheet> createState() => _MeetingShareSheetState();
}

class _MeetingShareSheetState extends ConsumerState<MeetingShareSheet> {
  late String _roomCode;
  String? _passcode;
  bool _revealPasscode = false;
  bool _isResetting = false;

  @override
  void initState() {
    super.initState();
    _roomCode = (widget.meeting['code'] ?? widget.meeting['room_name'] ?? widget.meeting['id'] ?? '').toString();
    _passcode = widget.meeting['passcode'] as String?;
    _revealPasscode = widget.isCreated;
    if (_passcode == null) {
      _fetchMeetingDetails();
    }
  }

  Future<void> _fetchMeetingDetails() async {
    final meetingId = widget.meeting['id'];
    if (meetingId == null) return;
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/meetings/$meetingId');
      final data = res.data as Map<String, dynamic>?;
      if (mounted && data != null) {
        setState(() {
          _passcode = data['passcode'] as String?;
          _roomCode = (data['code'] ?? data['room_name'] ?? _roomCode).toString();
        });
      }
    } catch (_) {}
  }

  Future<void> _resetPasscode() async {
    final meetingId = widget.meeting['id'];
    if (meetingId == null || _isResetting) return;

    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Créer un nouveau code secret ?'),
        content: const Text(
          'L\'ancien code cessera immédiatement de fonctionner. '
          'Les participants déjà admis conservent leur accès ; les nouveaux auront besoin du nouveau code.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.frenchNavy,
              foregroundColor: AppColors.pureWhite,
            ),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Générer'),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    setState(() => _isResetting = true);
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.post('/meetings/$meetingId/passcode');
      final newPass = (res.data as Map<String, dynamic>?)?['passcode'] as String?;

      if (mounted && newPass != null) {
        setState(() {
          _passcode = newPass;
          _revealPasscode = true;
          _isResetting = false;
        });
        widget.onPasscodeChanged?.call(newPass);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Nouveau code secret généré avec succès !'),
            backgroundColor: AppColors.good,
          ),
        );
      }
    } catch (_) {
      if (mounted) {
        setState(() => _isResetting = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Impossible de générer le code. Réessayez.'),
            backgroundColor: AppColors.bad,
          ),
        );
      }
    }
  }

  String _buildFullInvitation() {
    final title = widget.meeting['title'] ?? 'Classe Virtuelle';
    final batchName = widget.meeting['batch_name'] ?? 'Toutes promotions';
    final link = 'https://learnfrenchwithnatives.com/app/meeting/$_roomCode${_passcode != null ? '#pwd=$_passcode' : ''}';

    return '''🎓 Cours de Français : $title
Cohorte : $batchName

👉 Lien direct : $link
🔑 ID de réunion : $_roomCode
${_passcode != null ? '🔒 Code secret : $_passcode' : ''}

Note : Les étudiants inscrits rejoignent directement. Les invités attendent dans la salle d'attente l'approbation du professeur.''';
  }

  void _copyToClipboard(String text, String label) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$label copié dans le presse-papier !'),
        backgroundColor: AppColors.frenchNavy,
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.meeting['title'] ?? 'Classe Virtuelle';
    final batchName = widget.meeting['batch_name'] ?? 'Toutes promotions';

    return Container(
      height: MediaQuery.of(context).size.height * 0.85,
      padding: const EdgeInsets.only(top: 16),
      decoration: const BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        children: [
          // Handle
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
          const SizedBox(height: 12),

          // Header
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: widget.isCreated
                            ? AppColors.goodBg
                            : AppColors.frenchNavy.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        widget.isCreated ? Icons.check_circle_outline : Icons.share_outlined,
                        color: widget.isCreated ? AppColors.good : AppColors.frenchNavy,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          widget.isCreated ? 'RÉUNION CRÉÉE' : 'ACCÈS & PARTAGE',
                          style: AppTypography.caption.copyWith(
                            color: widget.isCreated ? AppColors.good : AppColors.frenchNavy,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.1,
                          ),
                        ),
                        Text(
                          'Détails d\'invitation',
                          style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
                        ),
                      ],
                    ),
                  ],
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          const Divider(height: 24, color: AppColors.borderSoft),

          // Content
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Class Title Card
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSoft,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.borderSoft),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: AppTypography.titleMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            color: AppColors.frenchNavy,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            const Icon(Icons.groups_outlined, size: 16, color: AppColors.textMuted),
                            const SizedBox(width: 6),
                            Text(
                              batchName,
                              style: AppTypography.caption.copyWith(color: AppColors.textMuted),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Meeting ID Row
                  Text(
                    'Identifiant de réunion (Meeting ID)',
                    style: AppTypography.label.copyWith(fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.frenchPaper,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.tag, color: AppColors.frenchNavy, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: SelectableText(
                            _roomCode,
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w700,
                              fontFamily: 'monospace',
                              letterSpacing: 1.2,
                              color: AppColors.ink,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: const Icon(Icons.copy, size: 18, color: AppColors.frenchNavy),
                          tooltip: 'Copier l\'ID',
                          onPressed: () => _copyToClipboard(_roomCode, 'Identifiant'),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 18),

                  // Passcode Row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Code secret (Passcode)',
                        style: AppTypography.label.copyWith(fontWeight: FontWeight.w700),
                      ),
                      if (_isResetting)
                        const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.frenchNavy),
                        )
                      else
                        InkWell(
                          onTap: _resetPasscode,
                          child: Row(
                            children: [
                              const Icon(Icons.refresh, size: 14, color: AppColors.frenchNavy),
                              const SizedBox(width: 4),
                              Text(
                                'Nouveau code',
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.frenchNavy,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    decoration: BoxDecoration(
                      color: AppColors.frenchPaper,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.border),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.lock_outline, color: AppColors.frenchNavy, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            _passcode != null
                                ? (_revealPasscode ? _passcode! : '••••••')
                                : 'Non défini',
                            style: AppTypography.bodyMedium.copyWith(
                              fontWeight: FontWeight.w700,
                              fontFamily: 'monospace',
                              letterSpacing: 2.0,
                              color: AppColors.ink,
                            ),
                          ),
                        ),
                        if (_passcode != null) ...[
                          IconButton(
                            icon: Icon(
                              _revealPasscode ? Icons.visibility_off : Icons.visibility,
                              size: 18,
                              color: AppColors.textMuted,
                            ),
                            tooltip: _revealPasscode ? 'Masquer' : 'Afficher',
                            onPressed: () => setState(() => _revealPasscode = !_revealPasscode),
                          ),
                          IconButton(
                            icon: const Icon(Icons.copy, size: 18, color: AppColors.frenchNavy),
                            tooltip: 'Copier le code',
                            onPressed: () => _copyToClipboard(_passcode!, 'Code secret'),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Pedagogical Explanation Box
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.frenchGoldBg.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: AppColors.frenchGold.withValues(alpha: 0.3)),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Icon(Icons.info_outline, color: AppColors.frenchGold, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            'Les étudiants de la cohorte assignée rejoignent directement sans code. '
                            'Toute autre personne doit entrer cet ID et le code secret, puis attendre dans la salle d\'attente que vous l\'acceptiez.',
                            style: AppTypography.caption.copyWith(
                              color: AppColors.ink,
                              height: 1.35,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Copy Full Invitation
                  CustomButton(
                    text: 'Copier l\'invitation complète',
                    icon: Icons.content_copy,
                    onPressed: () => _copyToClipboard(_buildFullInvitation(), 'Invitation complète'),
                  ),
                  const SizedBox(height: 12),
                  CustomButton(
                    text: 'Fermer',
                    variant: ButtonVariant.secondary,
                    onPressed: () => Navigator.pop(context),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
