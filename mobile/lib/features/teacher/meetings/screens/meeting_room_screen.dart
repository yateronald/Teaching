import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:livekit_client/livekit_client.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../services/livekit_meeting_controller.dart';
import '../widgets/meeting_chat_sheet.dart';
import '../widgets/meeting_controls.dart';
import '../widgets/meeting_participants_sheet.dart';

class MeetingRoomScreen extends ConsumerStatefulWidget {
  final dynamic meetingId;
  final String title;
  final String token;
  final String livekitUrl;
  final bool initialMicOn;
  final bool initialCamOn;

  const MeetingRoomScreen({
    super.key,
    required this.meetingId,
    required this.title,
    required this.token,
    required this.livekitUrl,
    this.initialMicOn = true,
    this.initialCamOn = true,
  });

  @override
  ConsumerState<MeetingRoomScreen> createState() => _MeetingRoomScreenState();
}

class _MeetingRoomScreenState extends ConsumerState<MeetingRoomScreen> {
  late LiveKitMeetingController _controller;
  int _elapsedSeconds = 0;
  Timer? _timer;
  Timer? _lobbyPollTimer;

  final List<MeetingChatMessage> _messages = [];
  final List<String> _flyingEmojis = [];
  List<Map<String, dynamic>> _admissions = [];

  @override
  void initState() {
    super.initState();
    _controller = LiveKitMeetingController();
    _connect();
    _startTimer();
    _startLobbyPolling();
  }

  void _startTimer() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (mounted) setState(() => _elapsedSeconds++);
    });
  }

  void _startLobbyPolling() {
    _pollLobby();
    _lobbyPollTimer = Timer.periodic(const Duration(seconds: 4), (_) {
      if (mounted) _pollLobby();
    });
  }

  Future<void> _pollLobby() async {
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/meetings/${widget.meetingId}/lobby');
      final list = (res.data?['pending'] as List?)?.cast<Map<String, dynamic>>() ?? [];
      if (mounted) {
        setState(() => _admissions = list);
      }
    } catch (_) {}
  }

  Future<void> _admitUser(int userId) async {
    setState(() {
      _admissions.removeWhere((a) => (a['userId'] ?? a['user_id']) == userId);
    });
    try {
      final client = ref.read(apiClientProvider);
      await client.post('/meetings/${widget.meetingId}/admit', data: {'user_id': userId});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Participant admis dans la classe !'),
            backgroundColor: AppColors.good,
            duration: Duration(seconds: 2),
          ),
        );
      }
      _pollLobby();
    } catch (_) {}
  }

  Future<void> _declineUser(int userId) async {
    setState(() {
      _admissions.removeWhere((a) => (a['userId'] ?? a['user_id']) == userId);
    });
    try {
      final client = ref.read(apiClientProvider);
      await client.post('/meetings/${widget.meetingId}/decline', data: {'user_id': userId});
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Demande d\'accès refusée.'),
            backgroundColor: AppColors.textMuted,
            duration: Duration(seconds: 2),
          ),
        );
      }
      _pollLobby();
    } catch (_) {}
  }

  Future<void> _admitAll() async {
    setState(() => _admissions.clear());
    try {
      final client = ref.read(apiClientProvider);
      await client.post('/meetings/${widget.meetingId}/admit-all');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Tous les participants ont été admis !'),
            backgroundColor: AppColors.good,
            duration: Duration(seconds: 2),
          ),
        );
      }
      _pollLobby();
    } catch (_) {}
  }

  Future<void> _connect() async {
    await _controller.connect(
      url: widget.livekitUrl,
      token: widget.token,
      startWithMic: widget.initialMicOn,
      startWithCam: widget.initialCamOn,
    );
  }

  @override
  void dispose() {
    _lobbyPollTimer?.cancel();
    _timer?.cancel();
    _controller.dispose();
    super.dispose();
  }

  String _formatElapsed(int sec) {
    final m = (sec ~/ 60).toString().padLeft(2, '0');
    final s = (sec % 60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  void _showReaction(String emoji) {
    setState(() => _flyingEmojis.add(emoji));
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _flyingEmojis.remove(emoji));
    });
  }

  void _confirmLeave() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Quitter la classe ?'),
        content: const Text('Êtes-vous sûr de vouloir quitter la réunion en direct ?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Annuler'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.bad,
              foregroundColor: AppColors.pureWhite,
            ),
            onPressed: () async {
              final nav = Navigator.of(context);
              nav.pop();
              await _controller.leaveRoom();
              if (mounted) {
                nav.pop();
              }
            },
            child: const Text('Quitter'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final participants = _controller.allParticipants;

        return Scaffold(
          backgroundColor: AppColors.frenchNavyDark,
          body: SafeArea(
            child: Stack(
              children: [
                Column(
                  children: [
                    // Header Bar
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 10,
                                height: 10,
                                decoration: const BoxDecoration(
                                  color: AppColors.bad,
                                  shape: BoxShape.circle,
                                ),
                              ),
                              const SizedBox(width: 8),
                              Text(
                                _formatElapsed(_elapsedSeconds),
                                style: AppTypography.caption.copyWith(
                                  color: AppColors.pureWhite,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                              const SizedBox(width: 12),
                              ConstrainedBox(
                                constraints: const BoxConstraints(maxWidth: 180),
                                child: Text(
                                  widget.title,
                                  style: AppTypography.titleSmall.copyWith(
                                    color: AppColors.pureWhite,
                                    fontWeight: FontWeight.w700,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.pureWhite.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.people, size: 14, color: AppColors.pureWhite),
                                const SizedBox(width: 4),
                                Text(
                                  '${participants.length}',
                                  style: AppTypography.caption.copyWith(
                                    color: AppColors.pureWhite,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    // Main Video Stage
                    Expanded(
                      child: _controller.isConnecting
                          ? const Center(
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  CircularProgressIndicator(color: AppColors.pureWhite),
                                  SizedBox(height: 16),
                                  Text(
                                    'Connexion au serveur WebRTC LiveKit...',
                                    style: TextStyle(color: AppColors.pureWhite),
                                  ),
                                ],
                              ),
                            )
                          : _controller.errorMessage != null
                              ? Center(
                                  child: Padding(
                                    padding: const EdgeInsets.all(24),
                                    child: Text(
                                      _controller.errorMessage!,
                                      style: const TextStyle(color: AppColors.bad),
                                      textAlign: TextAlign.center,
                                    ),
                                  ),
                                )
                              : _buildVideoGrid(participants),
                    ),

                    // Bottom Padding for controls
                    const SizedBox(height: 80),
                  ],
                ),

                // Floating Controls
                Positioned(
                  bottom: 20,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: MeetingControls(
                      isMicOn: _controller.isMicOn,
                      isCamOn: _controller.isCamOn,
                      isHandRaised: _controller.isHandRaised,
                      onToggleMic: _controller.toggleMicrophone,
                      onToggleCam: _controller.toggleCamera,
                      onFlipCam: _controller.flipCamera,
                      onToggleHand: _controller.toggleHandRaise,
                      onSendReaction: _showReaction,
                      onOpenChat: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (context) => MeetingChatSheet(
                            messages: _messages,
                            onSendMessage: (txt) {
                              setState(() {
                                _messages.add(MeetingChatMessage(
                                  sender: 'Vous',
                                  text: txt,
                                  time: TimeOfDay.now().format(context),
                                  isMe: true,
                                ));
                              });
                            },
                          ),
                        );
                      },
                      onOpenParticipants: () {
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (context) => MeetingParticipantsSheet(
                            participants: participants,
                            localParticipantIdentity: _controller.room?.localParticipant?.identity,
                            admissions: _admissions,
                            onAdmit: _admitUser,
                            onDecline: _declineUser,
                            onAdmitAll: _admitAll,
                          ),
                        );
                      },
                      onLeave: _confirmLeave,
                    ),
                  ),
                ),

                // Floating Admission Toast (Waiting Room Alert)
                if (_admissions.isNotEmpty)
                  Positioned(
                    top: 64,
                    left: 16,
                    right: 16,
                    child: _buildAdmissionToast(),
                  ),

                // Flying Reaction Emojis
                ..._flyingEmojis.map((e) => Positioned(
                      bottom: 100,
                      right: 40,
                      child: Text(e, style: const TextStyle(fontSize: 48)),
                    )),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildAdmissionToast() {
    final first = _admissions.first;
    final userName = (first['userName'] ?? first['user_name'] ?? 'Un participant').toString();
    final firstUserId = (first['userId'] ?? first['user_id'] as num?)?.toInt() ?? 0;
    final extraCount = _admissions.length - 1;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: AppColors.pureWhite,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.25),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(color: AppColors.frenchGold.withValues(alpha: 0.5), width: 1.2),
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
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  userName,
                  style: AppTypography.bodySmall.copyWith(
                    fontWeight: FontWeight.w700,
                    color: AppColors.ink,
                  ),
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  extraCount > 0
                      ? 'souhaite entrer (+$extraCount autre${extraCount > 1 ? 's' : ''})'
                      : 'souhaite rejoindre la classe',
                  style: AppTypography.caption.copyWith(
                    fontSize: 11,
                    color: AppColors.textMuted,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          TextButton(
            style: TextButton.styleFrom(
              foregroundColor: AppColors.bad,
              padding: const EdgeInsets.symmetric(horizontal: 8),
              visualDensity: VisualDensity.compact,
            ),
            onPressed: () => _declineUser(firstUserId),
            child: const Text('Refuser', style: TextStyle(fontSize: 12)),
          ),
          const SizedBox(width: 4),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.good,
              foregroundColor: AppColors.pureWhite,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              visualDensity: VisualDensity.compact,
            ),
            onPressed: () => extraCount > 0 ? _admitAll() : _admitUser(firstUserId),
            child: Text(
              extraCount > 0 ? 'Tout admettre' : 'Admettre',
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildVideoGrid(List<Participant> participants) {
    if (participants.isEmpty) {
      return const Center(
        child: Text('En attente de connexion...', style: TextStyle(color: AppColors.pureWhite)),
      );
    }

    final isSingle = participants.length == 1;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      child: GridView.builder(
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: isSingle ? 1 : 2,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: isSingle ? 1.3 : 1.0,
        ),
        itemCount: participants.length,
        itemBuilder: (context, idx) {
          final p = participants[idx];
          return _buildParticipantTile(p);
        },
      ),
    );
  }

  Widget _buildParticipantTile(Participant p) {
    final name = p.name.isNotEmpty ? p.name : p.identity;
    final isLocal = p is LocalParticipant;
    final videoPub = p.videoTrackPublications.firstOrNull;
    final hasVideo = videoPub != null && !videoPub.muted && videoPub.track != null;

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: p.isSpeaking ? AppColors.good : AppColors.pureWhite.withValues(alpha: 0.12),
          width: p.isSpeaking ? 2.5 : 1.0,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(15),
        child: Stack(
          alignment: Alignment.center,
          children: [
            if (hasVideo && videoPub.track is VideoTrack)
              VideoTrackRenderer(videoPub.track as VideoTrack)
            else
              CircleAvatar(
                radius: 36,
                backgroundColor: AppColors.frenchNavy,
                child: Text(
                  name.isNotEmpty ? name[0].toUpperCase() : '?',
                  style: const TextStyle(fontSize: 26, fontWeight: FontWeight.bold, color: AppColors.pureWhite),
                ),
              ),

            // Name Pill & Mic State
            Positioned(
              bottom: 8,
              left: 8,
              right: 8,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      isLocal ? 'Vous' : name,
                      style: AppTypography.caption.copyWith(
                        color: AppColors.pureWhite,
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  if (p.isMuted)
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(
                        color: AppColors.bad.withValues(alpha: 0.8),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.mic_off, size: 12, color: AppColors.pureWhite),
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
