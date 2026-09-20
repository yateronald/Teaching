import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';

class MeetingControls extends StatelessWidget {
  final bool isMicOn;
  final bool isCamOn;
  final bool isHandRaised;
  final VoidCallback onToggleMic;
  final VoidCallback onToggleCam;
  final VoidCallback onFlipCam;
  final VoidCallback onToggleHand;
  final Function(String emoji) onSendReaction;
  final VoidCallback onOpenChat;
  final VoidCallback onOpenParticipants;
  final VoidCallback onLeave;

  const MeetingControls({
    super.key,
    required this.isMicOn,
    required this.isCamOn,
    required this.isHandRaised,
    required this.onToggleMic,
    required this.onToggleCam,
    required this.onFlipCam,
    required this.onToggleHand,
    required this.onSendReaction,
    required this.onOpenChat,
    required this.onOpenParticipants,
    required this.onLeave,
  });

  void _showReactionPicker(BuildContext context) {
    const emojis = ['👏', '❤️', '😂', '🎉', '🤔', '👍', '🔥', '💯'];
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
        decoration: const BoxDecoration(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Wrap(
          spacing: 16,
          runSpacing: 16,
          alignment: WrapAlignment.center,
          children: emojis.map((e) {
            return InkWell(
              onTap: () {
                onSendReaction(e);
                Navigator.pop(context);
              },
              borderRadius: BorderRadius.circular(12),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.surfaceSoft,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(e, style: const TextStyle(fontSize: 26)),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.frenchNavyDark.withValues(alpha: 0.92),
        borderRadius: BorderRadius.circular(24),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Mic
          _buildCircleButton(
            icon: isMicOn ? Icons.mic : Icons.mic_off,
            color: isMicOn ? AppColors.pureWhite : AppColors.bad,
            bg: isMicOn ? AppColors.pureWhite.withValues(alpha: 0.15) : AppColors.bad.withValues(alpha: 0.25),
            onPressed: onToggleMic,
          ),
          const SizedBox(width: 8),

          // Cam
          _buildCircleButton(
            icon: isCamOn ? Icons.videocam : Icons.videocam_off,
            color: isCamOn ? AppColors.pureWhite : AppColors.bad,
            bg: isCamOn ? AppColors.pureWhite.withValues(alpha: 0.15) : AppColors.bad.withValues(alpha: 0.25),
            onPressed: onToggleCam,
          ),
          const SizedBox(width: 8),

          // Flip Cam
          if (isCamOn) ...[
            _buildCircleButton(
              icon: Icons.flip_camera_ios,
              color: AppColors.pureWhite,
              bg: AppColors.pureWhite.withValues(alpha: 0.15),
              onPressed: onFlipCam,
            ),
            const SizedBox(width: 8),
          ],

          // Hand Raise
          _buildCircleButton(
            icon: Icons.pan_tool,
            color: isHandRaised ? AppColors.frenchGold : AppColors.pureWhite,
            bg: isHandRaised ? AppColors.frenchGold.withValues(alpha: 0.25) : AppColors.pureWhite.withValues(alpha: 0.15),
            onPressed: onToggleHand,
          ),
          const SizedBox(width: 8),

          // Reactions
          _buildCircleButton(
            icon: Icons.emoji_emotions_outlined,
            color: AppColors.pureWhite,
            bg: AppColors.pureWhite.withValues(alpha: 0.15),
            onPressed: () => _showReactionPicker(context),
          ),
          const SizedBox(width: 8),

          // Chat
          _buildCircleButton(
            icon: Icons.chat_bubble_outline,
            color: AppColors.pureWhite,
            bg: AppColors.pureWhite.withValues(alpha: 0.15),
            onPressed: onOpenChat,
          ),
          const SizedBox(width: 8),

          // Participants
          _buildCircleButton(
            icon: Icons.people_outline,
            color: AppColors.pureWhite,
            bg: AppColors.pureWhite.withValues(alpha: 0.15),
            onPressed: onOpenParticipants,
          ),
          const SizedBox(width: 12),

          // Leave / End
          _buildCircleButton(
            icon: Icons.call_end,
            color: AppColors.pureWhite,
            bg: AppColors.bad,
            onPressed: onLeave,
          ),
        ],
      ),
    );
  }

  Widget _buildCircleButton({
    required IconData icon,
    required Color color,
    required Color bg,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: bg,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: color, size: 20),
      ),
    );
  }
}
