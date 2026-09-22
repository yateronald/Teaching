import 'package:flutter/material.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';

class MeetingControls extends StatelessWidget {
  final bool isMicOn;
  final bool isCamOn;
  final bool isHandRaised;
  final bool hasScreenShare;
  final bool isScreenSharing;
  final bool isScreenShareBusy;
  final int unreadChatCount;
  final bool isHost;
  final bool isRecording;
  final bool isTablet;
  final String meetingTitle;
  final int participantCount;
  final String? activePanel; // 'people' | 'chat' | 'polls'
  final VoidCallback onToggleMic;
  final VoidCallback onToggleCam;
  final VoidCallback onFlipCam;
  final VoidCallback? onToggleScreenShare;
  final VoidCallback onToggleHand;
  final Function(String emoji) onSendReaction;
  final VoidCallback onOpenChat;
  final VoidCallback onOpenParticipants;
  final VoidCallback? onOpenPolls;
  final VoidCallback onOpenMore;
  final VoidCallback onLeave;

  const MeetingControls({
    super.key,
    required this.isMicOn,
    required this.isCamOn,
    required this.isHandRaised,
    this.hasScreenShare = false,
    this.isScreenSharing = false,
    this.isScreenShareBusy = false,
    this.unreadChatCount = 0,
    this.isHost = false,
    this.isRecording = false,
    this.isTablet = false,
    this.meetingTitle = '',
    this.participantCount = 1,
    this.activePanel,
    required this.onToggleMic,
    required this.onToggleCam,
    required this.onFlipCam,
    this.onToggleScreenShare,
    required this.onToggleHand,
    required this.onSendReaction,
    required this.onOpenChat,
    required this.onOpenParticipants,
    this.onOpenPolls,
    required this.onOpenMore,
    required this.onLeave,
  });

  void _showReactionPicker(BuildContext context) {
    const emojis = ['👏', '❤️', '😂', '🎉', '🤔', '👍', '🔥', '💯'];
    final isFr = context.isFrench;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: const BoxDecoration(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              isFr ? 'Réactions' : 'Reactions',
              style: AppTypography.titleSmall.copyWith(
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 16),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              alignment: WrapAlignment.center,
              children: emojis.map((e) {
                return InkWell(
                  onTap: () {
                    onSendReaction(e);
                    Navigator.pop(context);
                  },
                  borderRadius: BorderRadius.circular(12),
                  child: Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppColors.surfaceSoft,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    alignment: Alignment.center,
                    child: Text(e, style: const TextStyle(fontSize: 28)),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (isTablet) {
      return _buildTabletBar(context);
    }
    return _buildMobileBar(context);
  }

  // ── Tablet Webapp-Exact Layout ──
  Widget _buildTabletBar(BuildContext context) {
    final now = TimeOfDay.now();
    final timeStr =
        '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';

    return Container(
      height: 64,
      padding: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF0E1116).withValues(alpha: 0.98),
        border: const Border(
          top: BorderSide(color: Color(0x1FFFFFFF), width: 1),
        ),
      ),
      child: Row(
        children: [
          // Left: time + meeting title
          Expanded(
            flex: 1,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  timeStr,
                  style: const TextStyle(
                    color: Color(0xFF9AA4B1),
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(width: 8),
                Container(
                  width: 3,
                  height: 3,
                  decoration: const BoxDecoration(
                    color: Color(0xFF6B7482),
                    shape: BoxShape.circle,
                  ),
                ),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    meetingTitle,
                    overflow: TextOverflow.ellipsis,
                    style: const TextStyle(
                      color: Color(0xFF9AA4B1),
                      fontSize: 13,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Center: main action buttons
          Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Mic (with caret-like styling)
              _buildControlBtn(
                icon: isMicOn ? Icons.mic : Icons.mic_off,
                color: AppColors.pureWhite,
                bg: isMicOn ? const Color(0xFF1F242D) : const Color(0xFFEF4444),
                onPressed: onToggleMic,
                tooltip: isMicOn ? 'Couper le micro' : 'Activer le micro',
              ),
              const SizedBox(width: 8),

              // Camera
              _buildControlBtn(
                icon: isCamOn ? Icons.videocam : Icons.videocam_off,
                color: AppColors.pureWhite,
                bg: isCamOn ? const Color(0xFF1F242D) : const Color(0xFFEF4444),
                onPressed: onToggleCam,
                tooltip: isCamOn ? 'Couper la caméra' : 'Activer la caméra',
              ),
              const SizedBox(width: 8),

              // Screen Share
              _buildControlBtn(
                icon: isScreenSharing
                    ? Icons.stop_screen_share
                    : Icons.screen_share_outlined,
                color: AppColors.pureWhite,
                bg: isScreenSharing
                    ? const Color(0xFF10B981)
                    : const Color(0xFF1F242D),
                onPressed: onToggleScreenShare ?? () {},
                tooltip: isScreenSharing
                    ? 'Arrêter le partage'
                    : 'Partager l\'écran',
                isLoading: isScreenShareBusy,
              ),
              const SizedBox(width: 8),

              // Hand Raise
              _buildControlBtn(
                icon: Icons.front_hand_outlined,
                color: isHandRaised
                    ? const Color(0xFF0F172A)
                    : AppColors.pureWhite,
                bg: isHandRaised
                    ? const Color(0xFFF59E0B)
                    : const Color(0xFF1F242D),
                onPressed: onToggleHand,
                tooltip: isHandRaised ? 'Baisser la main' : 'Lever la main',
              ),
              const SizedBox(width: 8),

              // Reactions
              _buildControlBtn(
                icon: Icons.sentiment_satisfied_alt_outlined,
                color: AppColors.pureWhite,
                bg: const Color(0xFF1F242D),
                onPressed: () => _showReactionPicker(context),
                tooltip: 'Envoyer une réaction',
              ),
              const SizedBox(width: 8),

              // More
              _buildControlBtn(
                icon: Icons.more_horiz,
                color: AppColors.pureWhite,
                bg: const Color(0xFF1F242D),
                onPressed: onOpenMore,
                tooltip: 'Plus d\'options',
                showDot: isRecording,
              ),
              const SizedBox(width: 12),

              // End Call (Red Pill / Circle)
              _buildControlBtn(
                icon: Icons.call_end,
                color: AppColors.pureWhite,
                bg: const Color(0xFFEF4444),
                onPressed: onLeave,
                tooltip: 'Quitter la classe',
                isWide: true,
              ),
            ],
          ),

          // Right: panel toggle buttons (People, Chat, Polls)
          Expanded(
            flex: 1,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                // People toggle
                _buildPanelToggleBtn(
                  icon: Icons.people_outline,
                  label: '$participantCount',
                  isActive: activePanel == 'people',
                  onPressed: onOpenParticipants,
                ),
                const SizedBox(width: 8),

                // Chat toggle
                _buildPanelToggleBtn(
                  icon: Icons.chat_bubble_outline,
                  badgeCount: unreadChatCount,
                  isActive: activePanel == 'chat',
                  onPressed: onOpenChat,
                ),

                // Polls toggle (if host)
                if (isHost && onOpenPolls != null) ...[
                  const SizedBox(width: 8),
                  _buildPanelToggleBtn(
                    icon: Icons.poll_outlined,
                    isActive: activePanel == 'polls',
                    onPressed: onOpenPolls!,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Mobile Responsive Floating Pill Layout ──
  Widget _buildMobileBar(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A).withValues(alpha: 0.96),
        borderRadius: BorderRadius.circular(28),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 20,
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
            color: AppColors.pureWhite,
            bg: isMicOn
                ? AppColors.pureWhite.withValues(alpha: 0.12)
                : AppColors.bad,
            onPressed: onToggleMic,
          ),
          const SizedBox(width: 5),

          // Cam
          _buildCircleButton(
            icon: isCamOn ? Icons.videocam : Icons.videocam_off,
            color: AppColors.pureWhite,
            bg: isCamOn
                ? AppColors.pureWhite.withValues(alpha: 0.12)
                : AppColors.bad,
            onPressed: onToggleCam,
          ),
          const SizedBox(width: 5),

          // Screen Share
          _buildCircleButton(
            icon: isScreenSharing
                ? Icons.stop_screen_share
                : Icons.screen_share_outlined,
            color: AppColors.pureWhite,
            bg: isScreenSharing
                ? const Color(0xFF10B981)
                : AppColors.pureWhite.withValues(alpha: 0.12),
            onPressed: onToggleScreenShare ?? () {},
            isLoading: isScreenShareBusy,
          ),
          const SizedBox(width: 5),

          // Hand Raise
          _buildCircleButton(
            icon: Icons.front_hand_outlined,
            color: isHandRaised ? AppColors.frenchGold : AppColors.pureWhite,
            bg: isHandRaised
                ? AppColors.frenchGold.withValues(alpha: 0.25)
                : AppColors.pureWhite.withValues(alpha: 0.12),
            onPressed: onToggleHand,
          ),
          const SizedBox(width: 5),

          // Chat (with badge)
          _buildBadgedButton(
            icon: Icons.chat_bubble_outline,
            color: AppColors.pureWhite,
            bg: AppColors.pureWhite.withValues(alpha: 0.12),
            badgeCount: unreadChatCount,
            onPressed: onOpenChat,
          ),
          const SizedBox(width: 5),

          // Participants
          _buildCircleButton(
            icon: Icons.people_outline,
            color: AppColors.pureWhite,
            bg: AppColors.pureWhite.withValues(alpha: 0.12),
            onPressed: onOpenParticipants,
          ),
          const SizedBox(width: 5),

          // More menu
          _buildCircleButton(
            icon: Icons.more_horiz,
            color: AppColors.pureWhite,
            bg: AppColors.pureWhite.withValues(alpha: 0.12),
            onPressed: onOpenMore,
          ),
          const SizedBox(width: 8),

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

  // ── Button Builders ──
  Widget _buildControlBtn({
    required IconData icon,
    required Color color,
    required Color bg,
    required VoidCallback onPressed,
    String? tooltip,
    bool showDot = false,
    bool isWide = false,
    bool isLoading = false,
  }) {
    final btn = InkWell(
      onTap: isLoading ? null : onPressed,
      borderRadius: BorderRadius.circular(isWide ? 22 : 21),
      child: Container(
        width: isWide ? 56 : 42,
        height: 42,
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(isWide ? 22 : 21),
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            if (isLoading)
              SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(strokeWidth: 2, color: color),
              )
            else
              Icon(icon, color: color, size: 20),
            if (showDot)
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  width: 7,
                  height: 7,
                  decoration: const BoxDecoration(
                    color: Color(0xFFEF4444),
                    shape: BoxShape.circle,
                  ),
                ),
              ),
          ],
        ),
      ),
    );

    if (tooltip != null) {
      return Tooltip(message: tooltip, child: btn);
    }
    return btn;
  }

  Widget _buildPanelToggleBtn({
    required IconData icon,
    String? label,
    int badgeCount = 0,
    bool isActive = false,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(10),
      child: Container(
        height: 38,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: isActive
              ? const Color(0xFF10B981).withValues(alpha: 0.2)
              : const Color(0xFF171B22),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isActive ? const Color(0xFF10B981) : const Color(0x1FFFFFFF),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isActive
                  ? const Color(0xFF10B981)
                  : const Color(0xFFE7EAEE),
              size: 18,
            ),
            if (label != null) ...[
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(
                  color: isActive
                      ? const Color(0xFF10B981)
                      : const Color(0xFFE7EAEE),
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
            if (badgeCount > 0) ...[
              const SizedBox(width: 6),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  badgeCount > 9 ? '9+' : '$badgeCount',
                  style: const TextStyle(
                    color: AppColors.pureWhite,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildCircleButton({
    required IconData icon,
    required Color color,
    required Color bg,
    required VoidCallback onPressed,
    double size = 42,
    bool isLoading = false,
  }) {
    return InkWell(
      onTap: isLoading ? null : onPressed,
      borderRadius: BorderRadius.circular(size / 2),
      child: Container(
        width: size,
        height: size,
        decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
        child: isLoading
            ? Center(
                child: SizedBox(
                  width: size * 0.42,
                  height: size * 0.42,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: color,
                  ),
                ),
              )
            : Icon(icon, color: color, size: size * 0.45),
      ),
    );
  }

  Widget _buildBadgedButton({
    required IconData icon,
    required Color color,
    required Color bg,
    required int badgeCount,
    required VoidCallback onPressed,
  }) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(21),
      child: SizedBox(
        width: 42,
        height: 42,
        child: Stack(
          alignment: Alignment.center,
          children: [
            Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(color: bg, shape: BoxShape.circle),
              child: Icon(icon, color: color, size: 19),
            ),
            if (badgeCount > 0)
              Positioned(
                top: 2,
                right: 2,
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 4,
                    vertical: 1,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.bad,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 16,
                    minHeight: 14,
                  ),
                  child: Text(
                    badgeCount > 99 ? '99+' : '$badgeCount',
                    style: const TextStyle(
                      color: AppColors.pureWhite,
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
