import 'package:flutter/material.dart';
import 'package:livekit_client/livekit_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';

class MeetingParticipantsSheet extends StatelessWidget {
  final List<Participant> participants;
  final String? localParticipantIdentity;
  final List<Map<String, dynamic>> admissions;
  final Function(int userId)? onAdmit;
  final Function(int userId)? onDecline;
  final VoidCallback? onAdmitAll;

  const MeetingParticipantsSheet({
    super.key,
    required this.participants,
    this.localParticipantIdentity,
    this.admissions = const [],
    this.onAdmit,
    this.onDecline,
    this.onAdmitAll,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.78,
      padding: const EdgeInsets.only(top: 16),
      decoration: const BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
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
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.people_alt_outlined, color: AppColors.frenchNavy, size: 20),
                    const SizedBox(width: 8),
                    Text(
                      'Participants (${participants.length + admissions.length})',
                      style: AppTypography.titleMedium.copyWith(fontWeight: FontWeight.w700),
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
          const Divider(height: 1, color: AppColors.borderSoft),

          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // ── WAITING ROOM SECTION (LOBBY ADMISSIONS) ──
                if (admissions.isNotEmpty) ...[
                  Container(
                    margin: const EdgeInsets.only(bottom: 18),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.warnBg.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: AppColors.warn.withValues(alpha: 0.3)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.hourglass_top, color: AppColors.warn, size: 18),
                                const SizedBox(width: 8),
                                Text(
                                  'En salle d\'attente (${admissions.length})',
                                  style: AppTypography.label.copyWith(
                                    fontWeight: FontWeight.w700,
                                    color: AppColors.warn,
                                  ),
                                ),
                              ],
                            ),
                            if (admissions.length > 1 && onAdmitAll != null)
                              InkWell(
                                onTap: onAdmitAll,
                                child: Text(
                                  'Tout admettre',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.good,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        ...admissions.map((a) {
                          final userId = (a['userId'] ?? a['user_id'] as num?)?.toInt() ?? 0;
                          final userName = (a['userName'] ?? a['user_name'] ?? 'Participant').toString();
                          final role = (a['role'] ?? 'invité').toString();

                          return Container(
                            margin: const EdgeInsets.only(top: 8),
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.pureWhite,
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.borderSoft),
                            ),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundColor: AppColors.frenchGoldBg,
                                  foregroundColor: AppColors.frenchGold,
                                  child: Text(
                                    userName.isNotEmpty ? userName[0].toUpperCase() : '?',
                                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        userName,
                                        style: AppTypography.bodySmall.copyWith(
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.ink,
                                        ),
                                      ),
                                      Text(
                                        role == 'teacher'
                                            ? 'Enseignant'
                                            : role == 'admin'
                                                ? 'Admin'
                                                : 'Étudiant / Invité',
                                        style: AppTypography.caption.copyWith(
                                          fontSize: 10,
                                          color: AppColors.textMuted,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                OutlinedButton(
                                  style: OutlinedButton.styleFrom(
                                    foregroundColor: AppColors.bad,
                                    side: const BorderSide(color: AppColors.bad, width: 1),
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                    visualDensity: VisualDensity.compact,
                                  ),
                                  onPressed: () => onDecline?.call(userId),
                                  child: const Text('Refuser', style: TextStyle(fontSize: 12)),
                                ),
                                const SizedBox(width: 6),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: AppColors.good,
                                    foregroundColor: AppColors.pureWhite,
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    visualDensity: VisualDensity.compact,
                                  ),
                                  onPressed: () => onAdmit?.call(userId),
                                  child: const Text('Admettre', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                          );
                        }),
                      ],
                    ),
                  ),
                ],

                // ── CONNECTED PARTICIPANTS SECTION ──
                Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: Text(
                    'Dans la classe (${participants.length})',
                    style: AppTypography.caption.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.textMuted,
                    ),
                  ),
                ),
                ...participants.map((p) {
                  final isLocal = p.identity == localParticipantIdentity || p is LocalParticipant;
                  final name = p.name.isNotEmpty ? p.name : p.identity;
                  final isMicMuted = p.isMuted;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: AppColors.pureWhite,
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: AppColors.borderSoft),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 18,
                          backgroundColor: isLocal ? AppColors.frenchNavy : AppColors.surfaceSoft,
                          foregroundColor: isLocal ? AppColors.pureWhite : AppColors.ink,
                          child: Text(
                            name.isNotEmpty ? name[0].toUpperCase() : '?',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Row(
                            children: [
                              Flexible(
                                child: Text(
                                  name,
                                  style: AppTypography.bodySmall.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: AppColors.ink,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                              if (isLocal) ...[
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: AppColors.teacherAccentSoft,
                                    borderRadius: BorderRadius.circular(4),
                                  ),
                                  child: Text(
                                    'Vous (Enseignant)',
                                    style: AppTypography.caption.copyWith(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: AppColors.teacherAccent,
                                    ),
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                        Icon(
                          isMicMuted ? Icons.mic_off : Icons.mic,
                          size: 18,
                          color: isMicMuted ? AppColors.bad : AppColors.good,
                        ),
                      ],
                    ),
                  );
                }),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
