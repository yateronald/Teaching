import 'package:flutter/material.dart';
import 'package:livekit_client/livekit_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/localization/translations.dart';

class MeetingParticipantsSheet extends StatefulWidget {
  final List<Participant> participants;
  final String? localParticipantIdentity;
  final List<Map<String, dynamic>> admissions;
  final Function(int userId) onAdmit;
  final Function(int userId) onDecline;
  final VoidCallback? onAdmitAll;
  final bool isHost;
  final Set<String> raisedHands;
  final String? teacherIdentity;
  final Function(String identity)? onKick;
  final Function(String identity)? onLowerHand;
  final VoidCallback? onLowerAllHands;
  final bool isDark;
  final bool isSheet;
  final bool showHeader;
  final VoidCallback? onClose;

  const MeetingParticipantsSheet({
    super.key,
    required this.participants,
    this.localParticipantIdentity,
    required this.admissions,
    required this.onAdmit,
    required this.onDecline,
    this.onAdmitAll,
    this.isHost = false,
    this.raisedHands = const {},
    this.teacherIdentity,
    this.onKick,
    this.onLowerHand,
    this.onLowerAllHands,
    this.isDark = false,
    this.isSheet = true,
    this.showHeader = true,
    this.onClose,
  });

  @override
  State<MeetingParticipantsSheet> createState() => _MeetingParticipantsSheetState();
}

class _MeetingParticipantsSheetState extends State<MeetingParticipantsSheet> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final isFr = context.isFrench;
    final isDark = widget.isDark;

    // Filter and sort participants
    final filtered = widget.participants.where((p) {
      final name = p.name.isNotEmpty ? p.name : p.identity;
      return name.toLowerCase().contains(_searchQuery.toLowerCase());
    }).toList();

    // Sort: Host/Teacher first, then local participant, then alphabetical
    filtered.sort((a, b) {
      final aIsTeacher = a.identity == widget.teacherIdentity;
      final bIsTeacher = b.identity == widget.teacherIdentity;
      if (aIsTeacher && !bIsTeacher) return -1;
      if (!aIsTeacher && bIsTeacher) return 1;

      final aIsLocal = a.identity == widget.localParticipantIdentity;
      final bIsLocal = b.identity == widget.localParticipantIdentity;
      if (aIsLocal && !bIsLocal) return -1;
      if (!aIsLocal && bIsLocal) return 1;

      final aName = a.name.isNotEmpty ? a.name : a.identity;
      final bName = b.name.isNotEmpty ? b.name : b.identity;
      return aName.compareTo(bName);
    });

    final content = Column(
      children: [
        // Drag handle (if sheet)
        if (widget.isSheet) ...[
          Center(
            child: Container(
              margin: const EdgeInsets.only(top: 8, bottom: 4),
              width: 44,
              height: 4,
              decoration: BoxDecoration(
                color: isDark ? const Color(0x3AFFFFFF) : AppColors.border,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          const SizedBox(height: 8),
        ],

        // Header
        if (widget.showHeader) ...[
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.people_alt_outlined,
                      color: isDark ? const Color(0xFFE7EAEE) : AppColors.frenchNavy,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${isFr ? 'Participants' : 'Participants'} (${widget.participants.length})',
                      style: TextStyle(
                        color: isDark ? const Color(0xFFE7EAEE) : AppColors.ink,
                        fontSize: 15,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
                IconButton(
                  icon: Icon(
                    Icons.close,
                    color: isDark ? const Color(0xFF9AA4B1) : AppColors.textMuted,
                  ),
                  onPressed: widget.onClose ?? () => Navigator.pop(context),
                ),
              ],
            ),
          ),
          Divider(
            height: 1,
            color: isDark ? const Color(0x1FFFFFFF) : AppColors.borderSoft,
          ),
        ],

        // Search bar
        Padding(
          padding: const EdgeInsets.fromLTRB(14, 10, 14, 6),
          child: TextField(
            onChanged: (v) => setState(() => _searchQuery = v),
            style: TextStyle(
              color: isDark ? const Color(0xFFE7EAEE) : AppColors.ink,
              fontSize: 13,
            ),
            decoration: InputDecoration(
              hintText: isFr ? 'Rechercher un participant...' : 'Search participant...',
              hintStyle: TextStyle(
                color: isDark ? const Color(0xFF6B7482) : AppColors.textSubtle,
                fontSize: 12.5,
              ),
              prefixIcon: Icon(
                Icons.search,
                size: 18,
                color: isDark ? const Color(0xFF9AA4B1) : AppColors.textMuted,
              ),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              filled: true,
              fillColor: isDark ? const Color(0xFF1F242D) : AppColors.surfaceSoft,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),

        // Scrollable list
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
            children: [
              // 1. Waiting room / Admissions Section (Host only)
              if (widget.admissions.isNotEmpty) ...[
                _buildAdmissionsSection(isFr, isDark),
                const SizedBox(height: 14),
              ],

              // 2. Raised Hands Section
              if (widget.raisedHands.isNotEmpty) ...[
                _buildRaisedHandsSection(isFr, isDark),
                const SizedBox(height: 14),
              ],

              // 3. In Class Participants Section
              Padding(
                padding: const EdgeInsets.only(top: 4, bottom: 6),
                child: Row(
                  children: [
                    Text(
                      isFr ? 'Dans la classe' : 'In the meeting',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 0.5,
                        color: isDark ? const Color(0xFF9AA4B1) : AppColors.textMuted,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: isDark
                            ? const Color(0xFF2A303B)
                            : AppColors.frenchNavy.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '${filtered.length}',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isDark ? const Color(0xFFE7EAEE) : AppColors.frenchNavy,
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              ...filtered.map((p) => _buildParticipantRow(p, isFr, isDark)),
            ],
          ),
        ),
      ],
    );

    if (widget.isSheet) {
      return Container(
        height: MediaQuery.of(context).size.height * 0.75,
        padding: const EdgeInsets.only(top: 6),
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF171B22) : AppColors.pureWhite,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: content,
      );
    }

    return Container(
      color: isDark ? const Color(0xFF171B22) : AppColors.pureWhite,
      child: content,
    );
  }

  Widget _buildAdmissionsSection(bool isFr, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF211C12) : AppColors.frenchGoldBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFF59E0B).withValues(alpha: 0.4),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Icon(Icons.meeting_room, color: Color(0xFFF59E0B), size: 18),
                  const SizedBox(width: 6),
                  Text(
                    '${isFr ? "En salle d'attente" : 'Waiting Room'} (${widget.admissions.length})',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isDark ? const Color(0xFFFCD34D) : AppColors.ink,
                    ),
                  ),
                ],
              ),
              if (widget.admissions.length > 1)
                TextButton(
                  style: TextButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    foregroundColor: const Color(0xFF10B981),
                  ),
                  onPressed: widget.onAdmitAll,
                  child: Text(
                    isFr ? 'Tout admettre' : 'Admit all',
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 8),
          ...widget.admissions.map((adm) {
            final userName = (adm['userName'] ?? adm['user_name'] ?? 'Participant').toString();
            final userId = (adm['userId'] ?? adm['user_id'] as num?)?.toInt() ?? 0;
            return Padding(
              padding: const EdgeInsets.only(bottom: 6),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: const Color(0xFFF59E0B),
                    foregroundColor: AppColors.pureWhite,
                    child: Text(
                      userName.isNotEmpty ? userName[0].toUpperCase() : '?',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      userName,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFFE7EAEE) : AppColors.ink,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  TextButton(
                    style: TextButton.styleFrom(
                      foregroundColor: const Color(0xFFEF4444),
                      visualDensity: VisualDensity.compact,
                      padding: const EdgeInsets.symmetric(horizontal: 8),
                    ),
                    onPressed: () => widget.onDecline(userId),
                    child: Text(isFr ? 'Refuser' : 'Decline', style: const TextStyle(fontSize: 12)),
                  ),
                  const SizedBox(width: 4),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF10B981),
                      foregroundColor: AppColors.pureWhite,
                      visualDensity: VisualDensity.compact,
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(6)),
                    ),
                    onPressed: () => widget.onAdmit(userId),
                    child: Text(isFr ? 'Admettre' : 'Admit', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildRaisedHandsSection(bool isFr, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF211C12) : AppColors.frenchGoldBg.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFF59E0B).withValues(alpha: 0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  const Text('✋', style: TextStyle(fontSize: 16)),
                  const SizedBox(width: 6),
                  Text(
                    '${isFr ? 'Mains levées' : 'Raised Hands'} (${widget.raisedHands.length})',
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isDark ? const Color(0xFFFCD34D) : AppColors.ink,
                    ),
                  ),
                ],
              ),
              if (widget.isHost && widget.onLowerAllHands != null)
                TextButton(
                  style: TextButton.styleFrom(
                    visualDensity: VisualDensity.compact,
                    foregroundColor: const Color(0xFF10B981),
                  ),
                  onPressed: widget.onLowerAllHands,
                  child: Text(
                    isFr ? 'Baisser tout' : 'Lower all',
                    style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 12),
                  ),
                ),
            ],
          ),
          const SizedBox(height: 6),
          ...widget.raisedHands.map((id) {
            final participant = widget.participants.where((p) => p.identity == id).firstOrNull;
            final name = participant != null
                ? (participant.name.isNotEmpty ? participant.name : participant.identity)
                : id;
            return Padding(
              padding: const EdgeInsets.symmetric(vertical: 3),
              child: Row(
                children: [
                  const Text('✋', style: TextStyle(fontSize: 14)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      name,
                      style: TextStyle(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: isDark ? const Color(0xFFE7EAEE) : AppColors.ink,
                      ),
                    ),
                  ),
                  if (widget.isHost && widget.onLowerHand != null)
                    TextButton(
                      style: TextButton.styleFrom(visualDensity: VisualDensity.compact),
                      onPressed: () => widget.onLowerHand!(id),
                      child: Text(
                        isFr ? 'Baisser' : 'Lower',
                        style: TextStyle(
                          fontSize: 11,
                          color: isDark ? const Color(0xFF9AA4B1) : AppColors.textMuted,
                        ),
                      ),
                    ),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildParticipantRow(Participant p, bool isFr, bool isDark) {
    final name = p.name.isNotEmpty ? p.name : p.identity;
    final isLocal = p.identity == widget.localParticipantIdentity;
    final isTeacher = p.identity == widget.teacherIdentity;
    final isHandRaised = widget.raisedHands.contains(p.identity);

    final videoPub = p.videoTrackPublications.firstOrNull;
    final hasVideo = videoPub != null && !videoPub.muted && videoPub.track != null;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          // Avatar
          CircleAvatar(
            radius: 17,
            backgroundColor: isTeacher
                ? const Color(0xFF10B981)
                : (isDark ? const Color(0xFF2A303B) : AppColors.frenchNavy),
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : '?',
              style: const TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: AppColors.pureWhite,
              ),
            ),
          ),
          const SizedBox(width: 10),

          // Name and Role
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        isLocal ? '${isFr ? 'Vous' : 'You'} ($name)' : name,
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.w600,
                          color: isDark ? const Color(0xFFE7EAEE) : AppColors.ink,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (isHandRaised) ...[
                      const SizedBox(width: 4),
                      const Text('✋', style: TextStyle(fontSize: 12)),
                    ],
                  ],
                ),
                Row(
                  children: [
                    if (isTeacher)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: const Color(0xFF10B981).withValues(alpha: 0.16),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: const Text(
                          'Host',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFF6EE7B7),
                          ),
                        ),
                      ),
                    if (isLocal && !isTeacher)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                        decoration: BoxDecoration(
                          color: isDark ? const Color(0xFF2A303B) : AppColors.surfaceSoft,
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Text(
                          isFr ? 'Vous' : 'You',
                          style: TextStyle(
                            fontSize: 9,
                            fontWeight: FontWeight.bold,
                            color: isDark ? const Color(0xFF9AA4B1) : AppColors.textMuted,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),

          // Status icons: Video
          Icon(
            hasVideo ? Icons.videocam : Icons.videocam_off,
            size: 18,
            color: hasVideo
                ? (isDark ? const Color(0xFF6EE7B7) : AppColors.frenchNavy)
                : const Color(0xFFEF4444),
          ),
          const SizedBox(width: 8),

          // Status icons: Mic
          Icon(
            p.isMuted ? Icons.mic_off : Icons.mic,
            size: 18,
            color: p.isMuted
                ? const Color(0xFFEF4444)
                : (isDark ? const Color(0xFF6EE7B7) : AppColors.frenchNavy),
          ),

          // Host kick menu (if host and not self)
          if (widget.isHost && !isLocal && widget.onKick != null) ...[
            const SizedBox(width: 4),
            PopupMenuButton<String>(
              icon: Icon(
                Icons.more_vert,
                size: 18,
                color: isDark ? const Color(0xFF9AA4B1) : AppColors.textMuted,
              ),
              padding: EdgeInsets.zero,
              itemBuilder: (context) => [
                PopupMenuItem(
                  value: 'kick',
                  child: Row(
                    children: [
                      const Icon(Icons.person_remove, color: AppColors.bad, size: 18),
                      const SizedBox(width: 8),
                      Text(
                        isFr ? 'Expulser de la classe' : 'Remove from class',
                        style: const TextStyle(color: AppColors.bad, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ],
              onSelected: (val) {
                if (val == 'kick') {
                  widget.onKick!(p.identity);
                }
              },
            ),
          ],
        ],
      ),
    );
  }
}
