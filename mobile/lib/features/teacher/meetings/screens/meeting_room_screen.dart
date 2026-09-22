import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:livekit_client/livekit_client.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';
import '../services/livekit_meeting_controller.dart';
import '../widgets/meeting_attendance_sheet.dart';
import '../widgets/meeting_chat_sheet.dart';
import '../widgets/meeting_controls.dart';
import '../widgets/meeting_participants_sheet.dart';
import '../widgets/meeting_polls_sheet.dart';

class MeetingRoomScreen extends ConsumerStatefulWidget {
  final dynamic meetingId;
  final String title;
  final String token;
  final String livekitUrl;
  final bool initialMicOn;
  final bool initialCamOn;
  final String? batchName;
  final String? roomCode;

  const MeetingRoomScreen({
    super.key,
    required this.meetingId,
    required this.title,
    required this.token,
    required this.livekitUrl,
    this.initialMicOn = true,
    this.initialCamOn = true,
    this.batchName,
    this.roomCode,
  });

  @override
  ConsumerState<MeetingRoomScreen> createState() => _MeetingRoomScreenState();
}

class _MeetingRoomScreenState extends ConsumerState<MeetingRoomScreen> {
  late LiveKitMeetingController _controller;
  int _elapsedSeconds = 0;
  Timer? _timer;
  Timer? _lobbyPollTimer;
  Timer? _meetingStatusTimer;
  Timer? _controlsAutoHideTimer;
  bool _isDisposed = false;
  bool _meetingEndHandled = false;

  // Socket.IO for real-time
  io.Socket? _socket;
  bool _isSocketConnected = false;
  int? _resolvedMeetingId;

  // Active side panel: 'people' | 'chat' | 'polls' | null
  String? _activePanel;

  // Fullscreen mode
  bool _isFullscreen = false;
  bool _showControlsInFullscreen = true;

  // Chat
  final List<MeetingChatMessage> _messages = [];
  int _unreadChat = 0;

  // Reactions
  final List<_FlyingEmoji> _flyingEmojis = [];
  int _emojiId = 0;

  // Lobby
  List<Map<String, dynamic>> _admissions = [];

  // Hand raises
  final Set<String> _raisedHands = {};

  // Polls
  bool _hasPollNotification = false;

  // Recording
  bool _isRecording = false;

  // Host info
  bool _isHost = false;
  String _myIdentity = '';
  String _myName = 'Vous';
  String? _teacherIdentity;

  @override
  void initState() {
    super.initState();
    _detectHostStatus();
    _controller = LiveKitMeetingController();
    _connect();
    _startTimer();
    _startLobbyPolling();
    _startMeetingStatusPolling();
    _resolveAndInitSocket();
  }

  void _detectHostStatus() {
    final user = ref.read(authNotifierProvider).user;
    if (user != null) {
      _myIdentity = user.id.toString();
      _myName = user.fullName.isNotEmpty ? user.fullName : 'Vous';
      _isHost = user.role == 'teacher' || user.role == 'admin';
      _teacherIdentity = _isHost ? _myIdentity : null;
    }
  }

  int get _meetingIdInt {
    if (_resolvedMeetingId != null && _resolvedMeetingId! > 0) {
      return _resolvedMeetingId!;
    }
    if (widget.meetingId is int && (widget.meetingId as int) > 0) {
      return widget.meetingId as int;
    }
    final parsed = int.tryParse(widget.meetingId.toString());
    if (parsed != null && parsed > 0) return parsed;
    return 0;
  }

  Future<void> _resolveAndInitSocket() async {
    if (_meetingIdInt <= 0) {
      final refCode = widget.roomCode ?? widget.meetingId?.toString();
      if (refCode != null && refCode.isNotEmpty) {
        try {
          final client = ref.read(apiClientProvider);
          final res = await client.get('/meetings/$refCode');
          final data = res.data;
          if (data is Map && data['id'] != null) {
            final id = data['id'] is int
                ? data['id'] as int
                : int.tryParse(data['id'].toString());
            if (id != null && id > 0) {
              _resolvedMeetingId = id;
              debugPrint(
                '[MeetingRoom] Resolved numeric meeting ID: $_resolvedMeetingId from ref $refCode',
              );
            }
          }
        } catch (e) {
          debugPrint(
            '[MeetingRoom] Could not resolve meeting ID from ref $refCode: $e',
          );
        }
      }
    }

    if (_isDisposed) return;
    await _initSocket();
  }

  void _subscribeToMeeting() {
    if (_socket == null) return;
    final id = _meetingIdInt;
    if (id <= 0) {
      debugPrint('[MeetingRoom] Cannot subscribe yet: invalid meetingId $id');
      return;
    }
    debugPrint('[MeetingRoom] Emitting meeting:subscribe for meetingId: $id');
    try {
      _socket!.emitWithAck(
        'meeting:subscribe',
        {'meetingId': id},
        ack: (res) {
          debugPrint('[MeetingRoom] meeting:subscribe ack response: $res');
          if (res is Map && res['ended'] == true) {
            _handleMeetingEnded();
          }
        },
      );
      _socket!.emit('meeting:join-room', id);
    } catch (e) {
      debugPrint('[MeetingRoom] Error emitting meeting:subscribe: $e');
    }
  }

  Future<void> _initSocket() async {
    try {
      final client = ref.read(apiClientProvider);
      final uri = Uri.parse(client.dio.options.baseUrl);
      final socketUrl = uri.origin;
      final token = await client.tokenStorage.getToken() ?? '';
      if (_isDisposed) return;

      // Clean up previous socket if any
      try {
        _socket?.clearListeners();
        _socket?.disconnect();
        _socket?.close();
        _socket?.dispose();
      } catch (_) {}

      _socket = io.io(
        socketUrl,
        io.OptionBuilder()
            .setTransports(['websocket', 'polling'])
            .setAuth({'token': token})
            .setExtraHeaders({'Authorization': 'Bearer $token'})
            .enableAutoConnect()
            .enableReconnection()
            .setReconnectionDelay(1000)
            .setReconnectionDelayMax(8000)
            .setTimeout(10000)
            .build(),
      );

      // Rebuild so child widgets (MeetingChatView) get the newly created socket instance
      if (!_isDisposed && mounted) {
        setState(() {});
      }

      _socket!.onConnect((_) {
        debugPrint('[MeetingRoom] Socket connected to $socketUrl');
        if (!_isDisposed && mounted) {
          setState(() => _isSocketConnected = true);
        }
        _subscribeToMeeting();
      });

      _socket!.onReconnect((_) {
        debugPrint('[MeetingRoom] Socket reconnected to $socketUrl');
        if (!_isDisposed && mounted) {
          setState(() => _isSocketConnected = true);
        }
        _subscribeToMeeting();
      });

      _socket!.onDisconnect((reason) {
        debugPrint('[MeetingRoom] Socket disconnected: $reason');
        if (!_isDisposed && mounted) {
          setState(() => _isSocketConnected = false);
        }
      });

      _socket!.onConnectError((err) {
        debugPrint('[MeetingRoom] Socket connect error: $err');
        if (!_isDisposed && mounted) {
          setState(() => _isSocketConnected = false);
        }
      });

      // Chat messages
      _socket!.on('meeting:chat-message', (data) {
        debugPrint('[MeetingRoom] Chat message received: $data');
        if (_isDisposed || !mounted) return;
        final d = data is Map ? data : {};
        final senderId = d['senderId']?.toString() ?? '';
        final isMine = _myIdentity.isNotEmpty && senderId == _myIdentity;
        if (isMine) return; // We already added our own messages locally

        final text = d['text']?.toString() ?? '';
        if (text.isEmpty) return;

        setState(() {
          _messages.add(
            MeetingChatMessage(
              id: d['id']?.toString(),
              sender: d['sender']?.toString() ?? 'Participant',
              text: text,
              time: _formatMsgTime(d['time']?.toString()),
              isMe: false,
            ),
          );
          if (_activePanel != 'chat') {
            _unreadChat++;
          }
        });
      });

      // Reactions
      _socket!.on('meeting:reaction', (data) {
        if (_isDisposed || !mounted) return;
        final d = data is Map ? data : {};
        _showReaction(
          d['emoji']?.toString() ?? '👏',
          d['senderName']?.toString() ?? '',
        );
      });

      // Hand raises
      _socket!.on('meeting:hand-raised', (data) {
        if (_isDisposed || !mounted) return;
        final d = data is Map ? data : {};
        final userId = d['userId']?.toString() ?? '';
        setState(() => _raisedHands.add(userId));
      });

      _socket!.on('meeting:hand-lowered', (data) {
        if (_isDisposed || !mounted) return;
        final d = data is Map ? data : {};
        final userId = d['userId']?.toString() ?? '';
        setState(() => _raisedHands.remove(userId));
        if (userId == _myIdentity) {
          _controller.setHandRaised(false);
        }
      });

      // Lobby updates (host only)
      _socket!.on('meeting:lobby-updated', (data) {
        if (_isDisposed || !mounted || !_isHost) return;
        final d = data is Map ? data : {};
        final pending =
            (d['pending'] as List?)?.cast<Map<String, dynamic>>() ?? [];
        setState(() => _admissions = pending);
      });

      // Poll events
      _socket!.on('poll:created', (data) {
        if (_isDisposed || !mounted) return;
        setState(() => _hasPollNotification = true);
      });

      // Recording events
      _socket!.on('meeting:recording-started', (data) {
        if (_isDisposed || !mounted) return;
        setState(() => _isRecording = true);
      });
      _socket!.on('meeting:recording-stopped', (data) {
        if (_isDisposed || !mounted) return;
        setState(() => _isRecording = false);
      });

      // Announcements
      _socket!.on('meeting:announcement', (data) {
        if (_isDisposed || !mounted) return;
        final d = data is Map ? data : {};
        final text = d['text']?.toString() ?? '';
        if (text.isNotEmpty) {
          _showAnnouncement(text);
        }
      });

      // Meeting ended by host or server
      _socket!.on('meeting:ended', (data) async {
        debugPrint('[MeetingRoom] Realtime meeting:ended received: $data');
        if (_isDisposed || !mounted) return;
        final event = data is Map ? data : const {};
        final eventMeetingId = int.tryParse('${event['meetingId'] ?? ''}');
        // Status events are broadcast so meeting lists can refresh. A room must
        // only react to the event for the meeting it is currently showing.
        if (eventMeetingId != null &&
            eventMeetingId > 0 &&
            eventMeetingId != _meetingIdInt) {
          return;
        }
        await _handleMeetingEnded();
      });

      // If socket is already connected when listeners are attached
      if (_socket!.connected) {
        if (!_isDisposed && mounted) {
          setState(() => _isSocketConnected = true);
        }
        _subscribeToMeeting();
      }
    } catch (e) {
      debugPrint('[MeetingRoom] Socket init error: $e');
    }
  }

  String _formatMsgTime(String? raw) {
    if (raw == null || raw.isEmpty) {
      final now = TimeOfDay.now();
      return '${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}';
    }
    try {
      final d = DateTime.parse(raw);
      return '${d.hour.toString().padLeft(2, '0')}:${d.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw;
    }
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

  void _startMeetingStatusPolling() {
    // Socket.IO is the fast path. This small fallback closes the room after a
    // reconnect or background interval in which Android missed the end event.
    _pollMeetingStatus();
    _meetingStatusTimer = Timer.periodic(const Duration(seconds: 8), (_) {
      if (mounted && !_meetingEndHandled) _pollMeetingStatus();
    });
  }

  Future<void> _pollMeetingStatus() async {
    if (_meetingEndHandled || _isDisposed) return;
    final refCode = _meetingIdInt > 0
        ? '$_meetingIdInt'
        : (widget.roomCode ?? widget.meetingId?.toString() ?? '');
    if (refCode.isEmpty) return;
    try {
      final client = ref.read(apiClientProvider);
      final response = await client.get('/meetings/$refCode');
      final data = response.data;
      if (data is Map && data['status']?.toString() == 'ended') {
        await _handleMeetingEnded();
      }
    } catch (_) {
      // Transient network errors must not eject somebody from a live class.
    }
  }

  Future<void> _handleMeetingEnded() async {
    if (_meetingEndHandled || _isDisposed) return;
    _meetingEndHandled = true;
    _timer?.cancel();
    _lobbyPollTimer?.cancel();
    _meetingStatusTimer?.cancel();
    await _controller.leaveRoom();
    if (mounted) Navigator.pop(context, true);
  }

  Future<void> _pollLobby() async {
    if (!_isHost) return;
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.get('/meetings/$_meetingIdInt/lobby');
      final list =
          (res.data?['pending'] as List?)?.cast<Map<String, dynamic>>() ?? [];
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
      await client.post(
        '/meetings/$_meetingIdInt/admit',
        data: {'user_id': userId},
      );
    } catch (_) {}
    _pollLobby();
  }

  Future<void> _declineUser(int userId) async {
    setState(() {
      _admissions.removeWhere((a) => (a['userId'] ?? a['user_id']) == userId);
    });
    try {
      final client = ref.read(apiClientProvider);
      await client.post(
        '/meetings/$_meetingIdInt/decline',
        data: {'user_id': userId},
      );
    } catch (_) {}
    _pollLobby();
  }

  Future<void> _admitAll() async {
    setState(() => _admissions.clear());
    try {
      final client = ref.read(apiClientProvider);
      await client.post('/meetings/$_meetingIdInt/admit-all');
    } catch (_) {}
    _pollLobby();
  }

  Future<void> _connect() async {
    await _controller.connect(
      url: widget.livekitUrl,
      token: widget.token,
      startWithMic: widget.initialMicOn,
      startWithCam: widget.initialCamOn,
    );
  }

  Future<void> _toggleScreenShare() async {
    final result = await _controller.toggleScreenShare();
    if (!mounted || result == ScreenShareToggleResult.cancelled) return;

    final isFr = context.isFrench;
    final (message, color) = switch (result) {
      ScreenShareToggleResult.started => (
        isFr ? 'Partage d\'écran démarré' : 'Screen sharing started',
        const Color(0xFF059669),
      ),
      ScreenShareToggleResult.stopped => (
        isFr ? 'Partage d\'écran arrêté' : 'Screen sharing stopped',
        const Color(0xFF334155),
      ),
      ScreenShareToggleResult.failed => (
        isFr
            ? 'Impossible de partager l\'écran. Réessayez ou vérifiez les autorisations.'
            : 'Could not share your screen. Try again or check permissions.',
        AppColors.bad,
      ),
      ScreenShareToggleResult.cancelled => ('', Colors.transparent),
    };

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Row(
            children: [
              Icon(
                result == ScreenShareToggleResult.failed
                    ? Icons.error_outline
                    : result == ScreenShareToggleResult.started
                    ? Icons.screen_share_outlined
                    : Icons.stop_screen_share_outlined,
                color: Colors.white,
                size: 20,
              ),
              const SizedBox(width: 10),
              Expanded(child: Text(message)),
            ],
          ),
          backgroundColor: color,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
  }

  @override
  void dispose() {
    _isDisposed = true;
    _controlsAutoHideTimer?.cancel();
    if (_isFullscreen) {
      try {
        SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
      } catch (_) {}
    }
    _lobbyPollTimer?.cancel();
    _meetingStatusTimer?.cancel();
    _timer?.cancel();
    try {
      _socket?.clearListeners();
      _socket?.disconnect();
      _socket?.close();
      _socket?.dispose();
    } catch (_) {}
    _socket = null;
    _controller.dispose();
    super.dispose();
  }

  String _formatElapsed(int sec) {
    final h = sec ~/ 3600;
    final m = (sec % 3600) ~/ 60;
    final s = sec % 60;
    if (h > 0) {
      return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    }
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  void _showReaction(String emoji, String sender) {
    final id = ++_emojiId;
    setState(() {
      _flyingEmojis.add(_FlyingEmoji(id: id, emoji: emoji, sender: sender));
    });
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted) {
        setState(() => _flyingEmojis.removeWhere((e) => e.id == id));
      }
    });
  }

  void _sendReaction(String emoji) {
    _socket?.emit('meeting:reaction', {
      'meetingId': _meetingIdInt,
      'emoji': emoji,
    });
    _showReaction(emoji, _myName);
  }

  void _toggleHand() {
    _controller.toggleHandRaise();
    if (_controller.isHandRaised) {
      _socket?.emit('meeting:raise-hand', {'meetingId': _meetingIdInt});
    } else {
      _socket?.emit('meeting:lower-hand', {
        'meetingId': _meetingIdInt,
        'userId': int.tryParse(_myIdentity) ?? 0,
      });
    }
  }

  void _showAnnouncement(String text) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.campaign, color: AppColors.pureWhite, size: 20),
            const SizedBox(width: 8),
            Expanded(child: Text(text)),
          ],
        ),
        backgroundColor: AppColors.frenchNavy,
        duration: const Duration(seconds: 6),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  void _confirmLeave() {
    final isFr = context.isFrench;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(isFr ? 'Quitter la classe ?' : 'Leave the class?'),
        content: Text(
          _isHost
              ? (isFr
                    ? 'En tant qu\'enseignant, voulez-vous quitter ou terminer la classe pour tous ?'
                    : 'As the teacher, do you want to leave or end the class for everyone?')
              : (isFr
                    ? 'Êtes-vous sûr de vouloir quitter la réunion en direct ?'
                    : 'Are you sure you want to leave the live meeting?'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(isFr ? 'Annuler' : 'Cancel'),
          ),
          if (_isHost)
            TextButton(
              onPressed: () async {
                Navigator.pop(ctx);
                try {
                  final client = ref.read(apiClientProvider);
                  final refCode = _meetingIdInt > 0
                      ? '$_meetingIdInt'
                      : (_resolvedMeetingId != null && _resolvedMeetingId! > 0
                            ? '$_resolvedMeetingId'
                            : (widget.roomCode ??
                                  widget.meetingId?.toString() ??
                                  ''));
                  await client.post('/meetings/$refCode/end');
                  await _handleMeetingEnded();
                } catch (e) {
                  debugPrint('[MeetingRoom] Error ending meeting: $e');
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text(
                          isFr
                              ? 'Impossible de terminer la classe. Veuillez réessayer.'
                              : 'Could not end the class. Please try again.',
                        ),
                        backgroundColor: AppColors.bad,
                      ),
                    );
                  }
                }
              },
              child: Text(
                isFr ? 'Terminer pour tous' : 'End for all',
                style: const TextStyle(color: AppColors.bad),
              ),
            ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.bad,
              foregroundColor: AppColors.pureWhite,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onPressed: () async {
              Navigator.pop(ctx);
              try {
                final client = ref.read(apiClientProvider);
                final refCode = _meetingIdInt > 0
                    ? '$_meetingIdInt'
                    : (_resolvedMeetingId != null && _resolvedMeetingId! > 0
                          ? '$_resolvedMeetingId'
                          : (widget.roomCode ??
                                widget.meetingId?.toString() ??
                                ''));
                await client.post('/meetings/$refCode/leave');
              } catch (_) {}
              await _controller.leaveRoom();
              if (mounted) Navigator.pop(context, false);
            },
            child: Text(isFr ? 'Quitter' : 'Leave'),
          ),
        ],
      ),
    );
  }

  void _openMoreMenu() {
    final isFr = context.isFrench;
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: const BoxDecoration(
          color: AppColors.pureWhite,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
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
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                isFr ? 'Plus d\'options' : 'More Options',
                style: AppTypography.titleSmall.copyWith(
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            const SizedBox(height: 8),
            const Divider(height: 1, color: AppColors.borderSoft),

            // Polls
            ListTile(
              leading: Stack(
                children: [
                  const Icon(Icons.poll_outlined, color: AppColors.frenchNavy),
                  if (_hasPollNotification)
                    Positioned(
                      top: 0,
                      right: 0,
                      child: Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(
                          color: AppColors.bad,
                          shape: BoxShape.circle,
                        ),
                      ),
                    ),
                ],
              ),
              title: Text(isFr ? 'Sondages' : 'Polls'),
              subtitle: Text(
                isFr
                    ? 'Créer et gérer des sondages'
                    : 'Create and manage polls',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
              onTap: () {
                Navigator.pop(ctx);
                setState(() => _hasPollNotification = false);
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (context) => MeetingPollsSheet(
                    meetingId: _meetingIdInt,
                    isHost: _isHost,
                  ),
                );
              },
            ),

            // Attendance (Émargement)
            ListTile(
              leading: const Icon(
                Icons.fact_check_outlined,
                color: AppColors.frenchNavy,
              ),
              title: Text(isFr ? 'Émargement' : 'Attendance'),
              subtitle: Text(
                isFr
                    ? 'Voir la présence des participants'
                    : 'View participant attendance',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textMuted,
                ),
              ),
              onTap: () {
                Navigator.pop(ctx);
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (context) => MeetingAttendanceSheet(
                    meetingId: _meetingIdInt,
                    meetingTitle: widget.title,
                  ),
                );
              },
            ),

            // Host-only options
            if (_isHost) ...[
              const Divider(height: 1, color: AppColors.borderSoft),
              ListTile(
                leading: Icon(
                  _isRecording ? Icons.stop_circle : Icons.fiber_manual_record,
                  color: _isRecording ? AppColors.bad : AppColors.frenchNavy,
                ),
                title: Text(
                  _isRecording
                      ? (isFr ? 'Arrêter l\'enregistrement' : 'Stop recording')
                      : (isFr ? 'Enregistrer la classe' : 'Record class'),
                ),
                onTap: () {
                  Navigator.pop(ctx);
                  _toggleRecording();
                },
              ),
              ListTile(
                leading: const Icon(
                  Icons.campaign_outlined,
                  color: AppColors.frenchNavy,
                ),
                title: Text(isFr ? 'Envoyer une annonce' : 'Send announcement'),
                onTap: () {
                  Navigator.pop(ctx);
                  _showAnnouncementDialog();
                },
              ),
            ],

            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Future<void> _toggleRecording() async {
    try {
      final client = ref.read(apiClientProvider);
      if (_isRecording) {
        await client.post('/meetings/$_meetingIdInt/recording/stop');
      } else {
        await client.post('/meetings/$_meetingIdInt/recording/start');
      }
    } catch (_) {}
  }

  void _showAnnouncementDialog() {
    final isFr = context.isFrench;
    final ctrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(isFr ? 'Envoyer une annonce' : 'Send Announcement'),
        content: TextField(
          controller: ctrl,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: isFr ? 'Votre message...' : 'Your message...',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(isFr ? 'Annuler' : 'Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.frenchNavy,
              foregroundColor: AppColors.pureWhite,
            ),
            onPressed: () {
              final text = ctrl.text.trim();
              if (text.isNotEmpty) {
                _socket?.emit('meeting:announcement', {
                  'meetingId': _meetingIdInt,
                  'text': text,
                });
              }
              Navigator.pop(ctx);
            },
            child: Text(isFr ? 'Envoyer' : 'Send'),
          ),
        ],
      ),
    );
  }

  void _toggleFullscreen() {
    _setFullscreen(!_isFullscreen);
  }

  void _setFullscreen(bool fullscreen) {
    if (_isFullscreen == fullscreen) return;
    _controlsAutoHideTimer?.cancel();
    setState(() {
      _isFullscreen = fullscreen;
      if (_isFullscreen) {
        _activePanel = null;
        _showControlsInFullscreen = false;
      } else {
        _showControlsInFullscreen = true;
      }
    });

    try {
      if (fullscreen) {
        SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
      } else {
        SystemChrome.setEnabledSystemUIMode(SystemUiMode.edgeToEdge);
      }
    } catch (e) {
      debugPrint('[MeetingRoom] SystemUiMode error: $e');
    }
  }

  void _toggleControlsVisibility() {
    if (!_isFullscreen) return;
    setState(() {
      _showControlsInFullscreen = !_showControlsInFullscreen;
      if (_showControlsInFullscreen) {
        _startAutoHideTimer();
      } else {
        _controlsAutoHideTimer?.cancel();
      }
    });
  }

  void _startAutoHideTimer() {
    _controlsAutoHideTimer?.cancel();
    _controlsAutoHideTimer = Timer(const Duration(seconds: 5), () {
      if (mounted && _isFullscreen && _showControlsInFullscreen) {
        setState(() => _showControlsInFullscreen = false);
      }
    });
  }

  void _handleOpenChat(bool isTablet, List<Participant> participants) {
    if (_isFullscreen) {
      _setFullscreen(false);
    }
    if (isTablet) {
      setState(() {
        _activePanel = _activePanel == 'chat' ? null : 'chat';
        _unreadChat = 0;
      });
    } else {
      setState(() => _unreadChat = 0);
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => MeetingChatSheet(
          meetingId: _meetingIdInt,
          messages: _messages,
          onNewMessage: (msg) {
            setState(() => _messages.add(msg));
          },
          socket: _socket,
          isSocketConnected: _isSocketConnected,
          myName: _myName,
          myIdentity: _myIdentity,
        ),
      );
    }
  }

  void _handleOpenParticipants(bool isTablet, List<Participant> participants) {
    if (_isFullscreen) {
      _setFullscreen(false);
    }
    if (isTablet) {
      setState(() {
        _activePanel = _activePanel == 'people' ? null : 'people';
      });
    } else {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => MeetingParticipantsSheet(
          participants: participants,
          localParticipantIdentity:
              _controller.room?.localParticipant?.identity,
          admissions: _admissions,
          onAdmit: _admitUser,
          onDecline: _declineUser,
          onAdmitAll: _admitAll,
          isHost: _isHost,
          raisedHands: _raisedHands,
          teacherIdentity: _teacherIdentity,
          onKick: _isHost ? (identity) => _kickParticipant(identity) : null,
          onLowerHand: (identity) {
            _socket?.emit('meeting:lower-hand', {
              'meetingId': _meetingIdInt,
              'userId': int.tryParse(identity) ?? 0,
            });
          },
          onLowerAllHands: () {
            for (final id in _raisedHands.toList()) {
              _socket?.emit('meeting:lower-hand', {
                'meetingId': _meetingIdInt,
                'userId': int.tryParse(id) ?? 0,
              });
            }
            setState(() => _raisedHands.clear());
          },
          isDark: true,
          isSheet: true,
        ),
      );
    }
  }

  void _handleOpenPolls(bool isTablet) {
    if (_isFullscreen) {
      _setFullscreen(false);
    }
    if (isTablet) {
      setState(() {
        _activePanel = _activePanel == 'polls' ? null : 'polls';
        _hasPollNotification = false;
      });
    } else {
      setState(() => _hasPollNotification = false);
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => MeetingPollsSheet(
          meetingId: _meetingIdInt,
          isHost: _isHost,
          isDark: true,
          isSheet: true,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isFr = context.isFrench;
    final isTablet = MediaQuery.of(context).size.width >= 800;

    return AnimatedBuilder(
      animation: _controller,
      builder: (context, _) {
        final participants = _controller.allParticipants;

        return PopScope(
          canPop: false,
          onPopInvokedWithResult: (didPop, result) {
            if (didPop) return;
            if (_isFullscreen) {
              _setFullscreen(false);
              return;
            }
            if (_activePanel != null) {
              setState(() => _activePanel = null);
              return;
            }
            _confirmLeave();
          },
          child: Scaffold(
            backgroundColor: const Color(0xFF0E1116),
            body: SafeArea(
              top: !_isFullscreen,
              bottom: !_isFullscreen,
              left: !_isFullscreen,
              right: !_isFullscreen,
              child: Stack(
                children: [
                  GestureDetector(
                    onTap: _isFullscreen ? _toggleControlsVisibility : null,
                    onDoubleTap: _toggleFullscreen,
                    behavior: HitTestBehavior.translucent,
                    child: Column(
                      children: [
                        // ── Top Bar (hidden in fullscreen if toggled off) ──
                        if (!_isFullscreen || _showControlsInFullscreen)
                          _buildTopBar(participants, isFr, isTablet),

                        // ── Main Content Area: Stage + Docked Side Panel (Tablet) ──
                        Expanded(
                          child: Row(
                            crossAxisAlignment: CrossAxisAlignment.stretch,
                            children: [
                              // Video Stage
                              Expanded(
                                child: _controller.isConnecting
                                    ? _buildConnectingState(isFr)
                                    : _controller.errorMessage != null
                                    ? _buildErrorState(isFr)
                                    : _buildMainStage(participants, isFr),
                              ),

                              // Docked Side Panel (tablet only when panel is open)
                              if (isTablet && _activePanel != null)
                                _buildDockedSidePanel(participants, isFr),
                            ],
                          ),
                        ),

                        // ── Bottom Controls Bar on Tablet ──
                        if (isTablet &&
                            (!_isFullscreen || _showControlsInFullscreen))
                          MeetingControls(
                            isMicOn: _controller.isMicOn,
                            isCamOn: _controller.isCamOn,
                            isHandRaised: _controller.isHandRaised,
                            hasScreenShare: _controller.hasRemoteScreenShare,
                            isScreenSharing: _controller.isScreenSharing,
                            isScreenShareBusy: _controller.isScreenShareBusy,
                            unreadChatCount: _unreadChat,
                            isHost: _isHost,
                            isRecording: _isRecording,
                            isTablet: true,
                            meetingTitle: widget.title,
                            participantCount: participants.length,
                            activePanel: _activePanel,
                            onToggleMic: _controller.toggleMicrophone,
                            onToggleCam: _controller.toggleCamera,
                            onFlipCam: _controller.flipCamera,
                            onToggleScreenShare: _toggleScreenShare,
                            onToggleHand: _toggleHand,
                            onSendReaction: _sendReaction,
                            onOpenChat: () =>
                                _handleOpenChat(true, participants),
                            onOpenParticipants: () =>
                                _handleOpenParticipants(true, participants),
                            onOpenPolls: () => _handleOpenPolls(true),
                            onOpenMore: _openMoreMenu,
                            onLeave: _confirmLeave,
                          ),

                        // Spacing on mobile phone
                        if (!isTablet && !_isFullscreen)
                          const SizedBox(height: 76),
                      ],
                    ),
                  ),

                  // ── Floating Controls on Mobile Phone ──
                  if (!isTablet &&
                      (!_isFullscreen || _showControlsInFullscreen))
                    Positioned(
                      bottom: 16,
                      left: 0,
                      right: 0,
                      child: Center(
                        child: MeetingControls(
                          isMicOn: _controller.isMicOn,
                          isCamOn: _controller.isCamOn,
                          isHandRaised: _controller.isHandRaised,
                          hasScreenShare: _controller.hasRemoteScreenShare,
                          isScreenSharing: _controller.isScreenSharing,
                          isScreenShareBusy: _controller.isScreenShareBusy,
                          unreadChatCount: _unreadChat,
                          isHost: _isHost,
                          isRecording: _isRecording,
                          isTablet: false,
                          meetingTitle: widget.title,
                          participantCount: participants.length,
                          activePanel: _activePanel,
                          onToggleMic: _controller.toggleMicrophone,
                          onToggleCam: _controller.toggleCamera,
                          onFlipCam: _controller.flipCamera,
                          onToggleScreenShare: _toggleScreenShare,
                          onToggleHand: _toggleHand,
                          onSendReaction: _sendReaction,
                          onOpenChat: () =>
                              _handleOpenChat(false, participants),
                          onOpenParticipants: () =>
                              _handleOpenParticipants(false, participants),
                          onOpenPolls: () => _handleOpenPolls(false),
                          onOpenMore: _openMoreMenu,
                          onLeave: _confirmLeave,
                        ),
                      ),
                    ),

                  // ── Floating Exit Fullscreen Button (when controls are hidden in fullscreen) ──
                  if (_isFullscreen && !_showControlsInFullscreen)
                    Positioned(
                      top: 16,
                      right: 16,
                      child: _buildFloatingExitFullscreenButton(isFr),
                    ),

                  // ── Floating Screen Share Badge in Fullscreen (when controls are hidden) ──
                  if (_isFullscreen &&
                      !_showControlsInFullscreen &&
                      _controller.hasRemoteScreenShare)
                    Positioned(
                      top: 16,
                      left: 16,
                      child: _buildFloatingScreenShareBadge(isFr),
                    ),

                  // ── Admission Toast ──
                  if (_admissions.isNotEmpty && _activePanel != 'people')
                    Positioned(
                      top: 56,
                      left: 16,
                      right: isTablet && _activePanel != null ? 384 : 16,
                      child: _buildAdmissionToast(),
                    ),

                  // ── Flying Reactions ──
                  ..._flyingEmojis.map(
                    (e) => _FlyingEmojiWidget(key: ValueKey(e.id), data: e),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildFloatingExitFullscreenButton(bool isFr) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () => _setFullscreen(false),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
          decoration: BoxDecoration(
            color: const Color(0xDD171B22),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: const Color(0xFF10B981).withValues(alpha: 0.7),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.5),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.fullscreen_exit,
                color: Color(0xFF10B981),
                size: 20,
              ),
              const SizedBox(width: 6),
              Text(
                isFr ? 'Quitter le plein écran' : 'Exit full screen',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12.5,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFloatingScreenShareBadge(bool isFr) {
    final screenSharer = _controller.screenShareParticipant;
    final name = screenSharer?.name.isNotEmpty == true
        ? screenSharer!.name
        : 'Participant';
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xDD171B22),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0x33FFFFFF), width: 1),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.5),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.screen_share, color: Color(0xFF10B981), size: 16),
          const SizedBox(width: 8),
          Text(
            '$name ${isFr ? 'présente son écran' : 'is presenting'}',
            style: const TextStyle(
              color: Colors.white,
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  // ── Tablet Docked Side Panel (Exact Webapp Replication) ──
  Widget _buildDockedSidePanel(List<Participant> participants, bool isFr) {
    return Container(
      width: 360,
      margin: const EdgeInsets.fromLTRB(0, 4, 12, 8),
      decoration: BoxDecoration(
        color: const Color(0xFF171B22),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0x1FFFFFFF), width: 1),
      ),
      clipBehavior: Clip.antiAlias,
      child: Column(
        children: [
          // Header with tabs: People | Chat | Polls (if host or active) + Close button
          Container(
            padding: const EdgeInsets.only(left: 10, right: 4, top: 2),
            decoration: const BoxDecoration(
              border: Border(
                bottom: BorderSide(color: Color(0x1FFFFFFF), width: 1),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Row(
                    children: [
                      _buildPanelTab(
                        tabKey: 'people',
                        label:
                            '${isFr ? 'Participants' : 'People'} ${participants.length}',
                        hasDot: _admissions.isNotEmpty,
                      ),
                      const SizedBox(width: 4),
                      _buildPanelTab(
                        tabKey: 'chat',
                        label: isFr ? 'Discussion' : 'Chat',
                        badgeCount: _unreadChat,
                      ),
                      if (_isHost || _hasPollNotification) ...[
                        const SizedBox(width: 4),
                        _buildPanelTab(
                          tabKey: 'polls',
                          label: isFr ? 'Sondages' : 'Polls',
                          hasDot: _hasPollNotification,
                        ),
                      ],
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(
                    Icons.close,
                    color: Color(0xFF9AA4B1),
                    size: 19,
                  ),
                  visualDensity: VisualDensity.compact,
                  onPressed: () => setState(() => _activePanel = null),
                ),
              ],
            ),
          ),

          // Body: Active tab view
          Expanded(
            child: _activePanel == 'people'
                ? MeetingParticipantsSheet(
                    participants: participants,
                    localParticipantIdentity:
                        _controller.room?.localParticipant?.identity,
                    admissions: _admissions,
                    onAdmit: _admitUser,
                    onDecline: _declineUser,
                    onAdmitAll: _admitAll,
                    isHost: _isHost,
                    raisedHands: _raisedHands,
                    teacherIdentity: _teacherIdentity,
                    onKick: _isHost
                        ? (identity) => _kickParticipant(identity)
                        : null,
                    onLowerHand: (identity) {
                      _socket?.emit('meeting:lower-hand', {
                        'meetingId': _meetingIdInt,
                        'userId': int.tryParse(identity) ?? 0,
                      });
                    },
                    onLowerAllHands: () {
                      for (final id in _raisedHands.toList()) {
                        _socket?.emit('meeting:lower-hand', {
                          'meetingId': _meetingIdInt,
                          'userId': int.tryParse(id) ?? 0,
                        });
                      }
                      setState(() => _raisedHands.clear());
                    },
                    isDark: true,
                    isSheet: false,
                    showHeader: false,
                  )
                : _activePanel == 'polls'
                ? MeetingPollsSheet(
                    meetingId: _meetingIdInt,
                    isHost: _isHost,
                    isDark: true,
                    isSheet: false,
                    showHeader: false,
                  )
                : MeetingChatView(
                    meetingId: _meetingIdInt,
                    messages: _messages,
                    onNewMessage: (msg) => setState(() => _messages.add(msg)),
                    socket: _socket,
                    isSocketConnected: _isSocketConnected,
                    myName: _myName,
                    myIdentity: _myIdentity,
                    isDark: true,
                    showHeader: false,
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildPanelTab({
    required String tabKey,
    required String label,
    int badgeCount = 0,
    bool hasDot = false,
  }) {
    final isActive = _activePanel == tabKey;
    return InkWell(
      onTap: () {
        setState(() {
          _activePanel = tabKey;
          if (tabKey == 'chat') _unreadChat = 0;
          if (tabKey == 'polls') _hasPollNotification = false;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
        decoration: BoxDecoration(
          border: Border(
            bottom: BorderSide(
              color: isActive ? const Color(0xFF10B981) : Colors.transparent,
              width: 2.5,
            ),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                color: isActive ? Colors.white : const Color(0xFF9AA4B1),
                fontSize: 13,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
            if (badgeCount > 0) ...[
              const SizedBox(width: 5),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                decoration: BoxDecoration(
                  color: const Color(0xFFEF4444),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  badgeCount > 9 ? '9+' : '$badgeCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 9.5,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
            if (hasDot && badgeCount == 0) ...[
              const SizedBox(width: 5),
              Container(
                width: 6,
                height: 6,
                decoration: const BoxDecoration(
                  color: Color(0xFFF59E0B),
                  shape: BoxShape.circle,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _kickParticipant(String identity) async {
    final isFr = context.isFrench;
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          isFr ? 'Expulser ce participant ?' : 'Remove this participant?',
        ),
        content: Text(
          isFr
              ? 'Le participant sera déconnecté et ne pourra pas rejoindre cette classe.'
              : 'They will be disconnected and cannot rejoin this class.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: Text(isFr ? 'Annuler' : 'Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.bad,
              foregroundColor: AppColors.pureWhite,
            ),
            onPressed: () => Navigator.pop(ctx, true),
            child: Text(isFr ? 'Expulser' : 'Remove'),
          ),
        ],
      ),
    );
    if (confirmed == true) {
      try {
        final client = ref.read(apiClientProvider);
        await client.post(
          '/meetings/$_meetingIdInt/kick',
          data: {'user_id': int.tryParse(identity) ?? 0},
        );
      } catch (_) {}
    }
  }

  // ── Top Bar (Exact Webapp Replication) ──
  Widget _buildTopBar(
    List<Participant> participants,
    bool isFr,
    bool isTablet,
  ) {
    final isCompact = !isTablet && MediaQuery.sizeOf(context).width < 600;

    final title = Row(
      children: [
        if (_isRecording) ...[
          Container(
            width: 8,
            height: 8,
            decoration: const BoxDecoration(
              color: Color(0xFFEF4444),
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
        ],
        Flexible(
          child: Text(
            widget.title,
            style: TextStyle(
              color: const Color(0xFFF1F5F9),
              fontWeight: FontWeight.w700,
              fontSize: isCompact ? 15 : 16,
              letterSpacing: -0.2,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ),
        if (widget.batchName?.isNotEmpty == true) ...[
          const SizedBox(width: 8),
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                color: const Color(0xFF1B2230),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF303947)),
              ),
              child: Text(
                widget.batchName!,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(
                  color: Color(0xFFB3BDCA),
                  fontWeight: FontWeight.w600,
                  fontSize: 10.5,
                ),
              ),
            ),
          ),
        ],
      ],
    );

    final fullscreen = Tooltip(
      message: _isFullscreen
          ? (isFr ? 'Quitter le plein écran' : 'Exit full screen')
          : (isFr ? 'Plein écran' : 'Full screen'),
      child: InkWell(
        onTap: _toggleFullscreen,
        borderRadius: BorderRadius.circular(11),
        child: Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: _isFullscreen
                ? const Color(0xFF10B981).withValues(alpha: 0.16)
                : const Color(0xFF181D25),
            borderRadius: BorderRadius.circular(11),
            border: Border.all(
              color: _isFullscreen
                  ? const Color(0xFF10B981)
                  : const Color(0xFF2A323E),
            ),
          ),
          child: Icon(
            _isFullscreen ? Icons.fullscreen_exit : Icons.fullscreen,
            color: _isFullscreen
                ? const Color(0xFF34D399)
                : const Color(0xFFE2E8F0),
            size: 21,
          ),
        ),
      ),
    );

    final statusLine = Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF171C24),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF29313D)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              _buildConnectionBars(),
              const SizedBox(width: 7),
              Text(
                _formatElapsed(_elapsedSeconds),
                style: const TextStyle(
                  color: Color(0xFFD5DBE4),
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                  fontFeatures: [FontFeature.tabularFigures()],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(width: 7),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
          decoration: BoxDecoration(
            color: const Color(0xFF171C24),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF29313D)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.people_outline,
                size: 14,
                color: Color(0xFF9EABB9),
              ),
              const SizedBox(width: 4),
              Text(
                '${participants.length}',
                style: const TextStyle(
                  color: Color(0xFFD5DBE4),
                  fontSize: 11.5,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ),
        if (widget.roomCode?.isNotEmpty == true) ...[
          const SizedBox(width: 7),
          ConstrainedBox(
            constraints: BoxConstraints(maxWidth: isCompact ? 142 : 190),
            child: InkWell(
              onTap: () {
                unawaited(
                  Clipboard.setData(ClipboardData(text: widget.roomCode!)),
                );
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      isFr ? 'Code de classe copié' : 'Meeting code copied',
                    ),
                    duration: const Duration(seconds: 2),
                  ),
                );
              },
              borderRadius: BorderRadius.circular(20),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF171C24),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF29313D)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.tag_rounded,
                      size: 13,
                      color: Color(0xFF9EABB9),
                    ),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        widget.roomCode!,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Color(0xFFD5DBE4),
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ],
    );

    return Container(
      padding: EdgeInsets.fromLTRB(
        isCompact ? 12 : 16,
        10,
        isCompact ? 12 : 16,
        9,
      ),
      decoration: const BoxDecoration(
        color: Color(0xFF0E1116),
        border: Border(bottom: BorderSide(color: Color(0xFF1B222C))),
      ),
      child: isCompact
          ? Column(
              children: [
                Row(
                  children: [
                    Expanded(child: title),
                    const SizedBox(width: 10),
                    fullscreen,
                  ],
                ),
                const SizedBox(height: 9),
                Align(alignment: Alignment.centerLeft, child: statusLine),
              ],
            )
          : Row(
              children: [
                Expanded(child: title),
                const SizedBox(width: 16),
                statusLine,
                const SizedBox(width: 8),
                fullscreen,
              ],
            ),
    );
  }

  Widget _buildConnectionBars() {
    final q = _controller.connectionQuality;
    final bars = q == ConnectionQuality.excellent
        ? 3
        : q == ConnectionQuality.good
        ? 2
        : q == ConnectionQuality.poor
        ? 1
        : 0;
    final color = bars >= 2
        ? AppColors.good
        : bars == 1
        ? AppColors.frenchGold
        : AppColors.pureWhite.withValues(alpha: 0.4);

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.end,
      children: List.generate(3, (i) {
        final active = i < bars;
        return Container(
          width: 3,
          height: 6.0 + (i * 3),
          margin: const EdgeInsets.only(right: 1),
          decoration: BoxDecoration(
            color: active ? color : AppColors.pureWhite.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(1),
          ),
        );
      }),
    );
  }

  // ── Connecting State ──
  Widget _buildConnectingState(bool isFr) {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          SizedBox(
            width: 48,
            height: 48,
            child: CircularProgressIndicator(
              color: AppColors.pureWhite.withValues(alpha: 0.8),
              strokeWidth: 3,
            ),
          ),
          const SizedBox(height: 20),
          Text(
            isFr
                ? 'Connexion à la classe en cours...'
                : 'Connecting to your class...',
            style: AppTypography.bodyMedium.copyWith(
              color: AppColors.pureWhite,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            isFr
                ? 'Veuillez patienter quelques instants'
                : 'Please wait a moment',
            style: AppTypography.caption.copyWith(
              color: AppColors.pureWhite.withValues(alpha: 0.6),
            ),
          ),
        ],
      ),
    );
  }

  // ── Error State ──
  Widget _buildErrorState(bool isFr) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.wifi_off_rounded,
              size: 56,
              color: AppColors.pureWhite.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              _controller.errorMessage!,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.pureWhite,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () {
                _controller.leaveRoom().then((_) => _connect());
              },
              icon: const Icon(Icons.refresh, size: 18),
              label: Text(isFr ? 'Réessayer' : 'Retry'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.pureWhite.withValues(alpha: 0.2),
                foregroundColor: AppColors.pureWhite,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Main Stage ──
  Widget _buildMainStage(List<Participant> participants, bool isFr) {
    if (participants.isEmpty) {
      return Center(
        child: Text(
          isFr ? 'En attente de connexion...' : 'Waiting for connection...',
          style: AppTypography.bodyMedium.copyWith(color: AppColors.pureWhite),
        ),
      );
    }

    // Screen share takes priority
    if (_controller.hasRemoteScreenShare) {
      return _buildScreenShareLayout(participants, isFr);
    }

    // Solo state
    if (participants.length == 1) {
      return _buildSoloState(participants.first, isFr);
    }

    // Grid layout
    return _buildVideoGrid(participants);
  }

  Widget _buildSoloState(Participant p, bool isFr) {
    final isCompact = MediaQuery.sizeOf(context).width < 600;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        // "You're the only one here" message (hidden in fullscreen)
        if (!_isFullscreen)
          Padding(
            padding: EdgeInsets.fromLTRB(
              isCompact ? 14 : 20,
              14,
              isCompact ? 14 : 20,
              0,
            ),
            child: Align(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 620),
                child: Container(
                  padding: EdgeInsets.symmetric(
                    horizontal: isCompact ? 14 : 18,
                    vertical: isCompact ? 11 : 13,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFF171C24),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF29313D)),
                  ),
                  child: Row(
                    children: [
                      Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: AppColors.good.withValues(alpha: 0.13),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.person_add_alt_1_rounded,
                          size: 18,
                          color: AppColors.good,
                        ),
                      ),
                      const SizedBox(width: 11),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              isFr
                                  ? 'Vous êtes seul ici'
                                  : 'You\'re the only one here',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.pureWhite,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              isFr
                                  ? 'Les participants apparaîtront ici dès leur arrivée.'
                                  : 'Participants will appear here as soon as they join.',
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: AppTypography.caption.copyWith(
                                color: const Color(0xFF9EABB9),
                                fontSize: 10.5,
                                height: 1.25,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        // Self tile
        Expanded(
          child: LayoutBuilder(
            builder: (context, constraints) {
              if (_isFullscreen) return _buildParticipantTile(p);
              final maxWidth = isCompact ? 520.0 : 960.0;
              final ratio = isCompact ? 0.82 : 16 / 9;
              return Padding(
                padding: EdgeInsets.all(isCompact ? 14 : 20),
                child: Center(
                  child: ConstrainedBox(
                    constraints: BoxConstraints(
                      maxWidth: maxWidth,
                      maxHeight: constraints.maxHeight,
                    ),
                    child: AspectRatio(
                      aspectRatio: ratio,
                      child: _buildParticipantTile(p),
                    ),
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildScreenShareLayout(List<Participant> participants, bool isFr) {
    final screenTrack = _controller.screenShareTrack;
    final screenSharer = _controller.screenShareParticipant;

    return Column(
      children: [
        // Screen share banner (hidden in fullscreen mode)
        if (!_isFullscreen)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            color: AppColors.good.withValues(alpha: 0.15),
            child: Row(
              children: [
                const Icon(Icons.screen_share, size: 16, color: AppColors.good),
                const SizedBox(width: 8),
                Text(
                  '${screenSharer?.name.isNotEmpty == true ? screenSharer!.name : 'Participant'} ${isFr ? 'présente son écran' : 'is presenting'}',
                  style: AppTypography.caption.copyWith(
                    color: AppColors.good,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const Spacer(),
                InkWell(
                  onTap: _toggleFullscreen,
                  borderRadius: BorderRadius.circular(6),
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.good.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(6),
                      border: Border.all(
                        color: AppColors.good.withValues(alpha: 0.4),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(
                          Icons.fullscreen,
                          size: 16,
                          color: AppColors.good,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          isFr ? 'Plein écran' : 'Full screen',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.good,
                            fontWeight: FontWeight.w600,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

        // Screen share content
        Expanded(
          flex: _isFullscreen ? 1 : 3,
          child: Padding(
            padding: _isFullscreen ? EdgeInsets.zero : const EdgeInsets.all(8),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF0F172A),
                borderRadius: _isFullscreen
                    ? BorderRadius.zero
                    : BorderRadius.circular(12),
                border: _isFullscreen
                    ? null
                    : Border.all(color: AppColors.good.withValues(alpha: 0.3)),
              ),
              child: ClipRRect(
                borderRadius: _isFullscreen
                    ? BorderRadius.zero
                    : BorderRadius.circular(11),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    screenTrack != null
                        ? VideoTrackRenderer(screenTrack)
                        : Center(
                            child: Text(
                              isFr
                                  ? 'Chargement du partage d\'écran...'
                                  : 'Loading screen share...',
                              style: AppTypography.caption.copyWith(
                                color: AppColors.pureWhite,
                              ),
                            ),
                          ),
                    // Quick fullscreen overlay button on the video when not in fullscreen
                    if (!_isFullscreen)
                      Positioned(
                        top: 10,
                        right: 10,
                        child: InkWell(
                          onTap: _toggleFullscreen,
                          borderRadius: BorderRadius.circular(6),
                          child: Container(
                            padding: const EdgeInsets.all(6),
                            decoration: BoxDecoration(
                              color: Colors.black.withValues(alpha: 0.65),
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.2),
                              ),
                            ),
                            child: const Icon(
                              Icons.fullscreen,
                              size: 18,
                              color: Colors.white,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ),
        ),

        // Participant thumbnails (only when not in fullscreen)
        if (!_isFullscreen) ...[
          SizedBox(
            height: 100,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: participants.length,
              separatorBuilder: (_, index) => const SizedBox(width: 8),
              itemBuilder: (context, idx) {
                return SizedBox(
                  width: 130,
                  child: _buildParticipantTile(participants[idx]),
                );
              },
            ),
          ),
          const SizedBox(height: 8),
        ],
      ],
    );
  }

  Widget _buildVideoGrid(List<Participant> participants) {
    final count = participants.length;
    return LayoutBuilder(
      builder: (context, constraints) {
        final isCompact = constraints.maxWidth < 600;
        final int crossAxisCount;
        final double ratio;

        if (isCompact) {
          crossAxisCount = count <= 2 ? 1 : 2;
          ratio = count <= 2 ? 16 / 10 : 0.82;
        } else if (count <= 2) {
          crossAxisCount = count;
          ratio = 16 / 10;
        } else if (count <= 4) {
          crossAxisCount = 2;
          ratio = 1.25;
        } else {
          crossAxisCount = constraints.maxWidth >= 1050 ? 3 : 2;
          ratio = 1.15;
        }

        return GridView.builder(
          padding: EdgeInsets.symmetric(
            horizontal: isCompact ? 12 : 18,
            vertical: isCompact ? 10 : 14,
          ),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: crossAxisCount,
            crossAxisSpacing: isCompact ? 8 : 12,
            mainAxisSpacing: isCompact ? 8 : 12,
            childAspectRatio: ratio,
          ),
          itemCount: count,
          itemBuilder: (context, idx) =>
              _buildParticipantTile(participants[idx]),
        );
      },
    );
  }

  Widget _buildParticipantTile(Participant p) {
    final name = p.name.isNotEmpty ? p.name : p.identity;
    final isLocal = p is LocalParticipant;
    final videoPub = p.videoTrackPublications
        .where((pub) => pub.source != TrackSource.screenShareVideo)
        .firstOrNull;
    final hasVideo =
        videoPub != null && !videoPub.muted && videoPub.track != null;
    final isTeacher = p.identity == _teacherIdentity;
    final hasHandRaised = _raisedHands.contains(p.identity);

    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: p.isSpeaking
              ? AppColors.good
              : AppColors.pureWhite.withValues(alpha: 0.08),
          width: p.isSpeaking ? 2.5 : 1.0,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(13),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Video or Avatar
            if (hasVideo && videoPub.track is VideoTrack)
              SizedBox.expand(
                child: VideoTrackRenderer(videoPub.track as VideoTrack),
              )
            else
              CircleAvatar(
                radius: 32,
                backgroundColor: _avatarColor(name),
                child: Text(
                  _initials(name),
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppColors.pureWhite,
                  ),
                ),
              ),

            // Hand raised indicator
            if (hasHandRaised)
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: BoxDecoration(
                    color: AppColors.frenchGold.withValues(alpha: 0.9),
                    shape: BoxShape.circle,
                  ),
                  child: const Text('✋', style: TextStyle(fontSize: 12)),
                ),
              ),

            // Bottom overlay: Name + Role + Mic
            Positioned(
              bottom: 0,
              left: 0,
              right: 0,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.bottomCenter,
                    end: Alignment.topCenter,
                    colors: [
                      Colors.black.withValues(alpha: 0.7),
                      Colors.transparent,
                    ],
                  ),
                ),
                child: Row(
                  children: [
                    // Name + optional role badge
                    Expanded(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (p.isSpeaking)
                            Container(
                              width: 6,
                              height: 6,
                              margin: const EdgeInsets.only(right: 4),
                              decoration: const BoxDecoration(
                                color: AppColors.good,
                                shape: BoxShape.circle,
                              ),
                            ),
                          Flexible(
                            child: Text(
                              isLocal ? 'Vous' : name,
                              style: AppTypography.caption.copyWith(
                                color: AppColors.pureWhite,
                                fontWeight: FontWeight.w600,
                                fontSize: 11,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          if (isTeacher || isLocal) ...[
                            const SizedBox(width: 4),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 4,
                                vertical: 1,
                              ),
                              decoration: BoxDecoration(
                                color: isTeacher
                                    ? AppColors.frenchGold.withValues(
                                        alpha: 0.3,
                                      )
                                    : AppColors.frenchNavy.withValues(
                                        alpha: 0.5,
                                      ),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                isTeacher ? 'Hôte' : 'Vous',
                                style: TextStyle(
                                  fontSize: 8,
                                  fontWeight: FontWeight.w700,
                                  color: isTeacher
                                      ? AppColors.frenchGold
                                      : AppColors.pureWhite,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    // Mic indicator
                    if (p.isMuted)
                      Container(
                        padding: const EdgeInsets.all(3),
                        decoration: BoxDecoration(
                          color: AppColors.bad.withValues(alpha: 0.8),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.mic_off,
                          size: 10,
                          color: AppColors.pureWhite,
                        ),
                      ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _avatarColor(String name) {
    final colors = [
      const Color(0xFF10B981),
      const Color(0xFF6366F1),
      const Color(0xFFF59E0B),
      const Color(0xFFEF4444),
      const Color(0xFFEC4899),
      const Color(0xFF14B8A6),
      const Color(0xFF8B5CF6),
    ];
    return colors[name.hashCode.abs() % colors.length];
  }

  String _initials(String name) {
    final parts = name.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts[0][0]}${parts[1][0]}'.toUpperCase();
    }
    return name.isNotEmpty ? name[0].toUpperCase() : '?';
  }

  Widget _buildAdmissionToast() {
    final first = _admissions.first;
    final userName =
        (first['userName'] ?? first['user_name'] ?? 'Un participant')
            .toString();
    final firstUserId =
        (first['userId'] ?? first['user_id'] as num?)?.toInt() ?? 0;
    final extraCount = _admissions.length - 1;
    final isFr = context.isFrench;

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
        border: Border.all(
          color: AppColors.frenchGold.withValues(alpha: 0.5),
          width: 1.2,
        ),
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
                      ? (isFr
                            ? 'souhaite entrer (+$extraCount autre${extraCount > 1 ? 's' : ''})'
                            : 'wants to join (+$extraCount other${extraCount > 1 ? 's' : ''})')
                      : (isFr
                            ? 'souhaite rejoindre la classe'
                            : 'wants to join the class'),
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
            child: Text(
              isFr ? 'Refuser' : 'Decline',
              style: const TextStyle(fontSize: 12),
            ),
          ),
          const SizedBox(width: 4),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.good,
              foregroundColor: AppColors.pureWhite,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              visualDensity: VisualDensity.compact,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(8),
              ),
            ),
            onPressed: () =>
                extraCount > 0 ? _admitAll() : _admitUser(firstUserId),
            child: Text(
              extraCount > 0
                  ? (isFr ? 'Tout admettre' : 'Admit all')
                  : (isFr ? 'Admettre' : 'Admit'),
              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Flying Emoji Data ──
class _FlyingEmoji {
  final int id;
  final String emoji;
  final String sender;
  _FlyingEmoji({required this.id, required this.emoji, required this.sender});
}

// ── Flying Emoji Widget (animated) ──
class _FlyingEmojiWidget extends StatefulWidget {
  final _FlyingEmoji data;
  const _FlyingEmojiWidget({super.key, required this.data});

  @override
  State<_FlyingEmojiWidget> createState() => _FlyingEmojiWidgetState();
}

class _FlyingEmojiWidgetState extends State<_FlyingEmojiWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _anim;

  @override
  void initState() {
    super.initState();
    _anim = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2500),
    )..forward();
  }

  @override
  void dispose() {
    _anim.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    final xPos =
        (widget.data.emoji.hashCode.abs() % 30) / 100.0 * screenWidth +
        screenWidth * 0.6;

    return AnimatedBuilder(
      animation: _anim,
      builder: (context, child) {
        return Positioned(
          bottom: 100 + (_anim.value * 300),
          right: screenWidth - xPos,
          child: Opacity(
            opacity: 1.0 - _anim.value,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(widget.data.emoji, style: const TextStyle(fontSize: 36)),
                if (widget.data.sender.isNotEmpty)
                  Text(
                    widget.data.sender,
                    style: AppTypography.caption.copyWith(
                      color: AppColors.pureWhite.withValues(alpha: 0.7),
                      fontSize: 9,
                    ),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
