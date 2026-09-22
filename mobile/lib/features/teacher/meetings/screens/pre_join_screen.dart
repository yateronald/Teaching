import 'dart:async';
import 'dart:math';
import 'dart:typed_data';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:just_audio/just_audio.dart';
import 'package:livekit_client/livekit_client.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/localization/translations.dart';
import 'meeting_room_screen.dart';

class PreJoinScreen extends ConsumerStatefulWidget {
  final Map<String, dynamic> meeting;
  final String? passcode;

  const PreJoinScreen({
    super.key,
    required this.meeting,
    this.passcode,
  });

  @override
  ConsumerState<PreJoinScreen> createState() => _PreJoinScreenState();
}

class _PreJoinScreenState extends ConsumerState<PreJoinScreen> with SingleTickerProviderStateMixin {
  bool _isMicOn = true;
  bool _isCamOn = true;
  bool _isLoading = false;
  bool _inLobby = false;
  Timer? _lobbyPollTimer;
  String? _errorMessage;

  // Real Camera Preview
  LocalVideoTrack? _cameraTrack;
  bool _isCameraInitializing = false;

  // Speaker Testing
  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isPlayingTestSound = false;

  // Mic level animation
  late AnimationController _micAnimController;

  @override
  void initState() {
    super.initState();
    _micAnimController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    )..repeat(reverse: true);

    _initDevices();
  }

  @override
  void dispose() {
    _lobbyPollTimer?.cancel();
    _micAnimController.dispose();
    _audioPlayer.dispose();
    _stopCamera();
    super.dispose();
  }

  Future<void> _initDevices() async {
    try {
      await [Permission.camera, Permission.microphone].request();
    } catch (_) {}

    if (_isCamOn) {
      await _startCamera();
    }
  }

  Future<void> _startCamera() async {
    if (_cameraTrack != null || _isCameraInitializing) return;
    setState(() => _isCameraInitializing = true);
    try {
      final track = await LocalVideoTrack.createCameraTrack(
        const CameraCaptureOptions(
          cameraPosition: CameraPosition.front,
          params: VideoParametersPresets.h720_169,
        ),
      );
      if (mounted) {
        setState(() {
          _cameraTrack = track;
          _isCameraInitializing = false;
        });
      } else {
        await track.stop();
        await track.dispose();
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isCameraInitializing = false;
        });
      }
    }
  }

  Future<void> _stopCamera() async {
    final track = _cameraTrack;
    _cameraTrack = null;
    if (track != null) {
      try {
        await track.stop();
        await track.dispose();
      } catch (_) {}
    }
    if (mounted) setState(() {});
  }

  void _toggleCam() async {
    final next = !_isCamOn;
    setState(() => _isCamOn = next);
    if (next) {
      await _startCamera();
    } else {
      await _stopCamera();
    }
  }

  void _toggleMic() {
    setState(() => _isMicOn = !_isMicOn);
  }

  Future<void> _testSpeaker() async {
    if (_isPlayingTestSound) return;
    setState(() => _isPlayingTestSound = true);

    try {
      final wavBytes = _generateChimeWav();
      final source = AudioSource.uri(Uri.dataFromBytes(wavBytes, mimeType: 'audio/wav'));
      await _audioPlayer.setAudioSource(source);
      await _audioPlayer.play();
      await Future.delayed(const Duration(milliseconds: 1400));
    } catch (_) {
    } finally {
      if (mounted) {
        setState(() => _isPlayingTestSound = false);
      }
    }
  }

  Uint8List _generateChimeWav() {
    const sampleRate = 22050;
    const durationSec = 1.2;
    final totalSamples = (sampleRate * durationSec).toInt();
    final pcm = Int16List(totalSamples);

    // Three harmonic tones: C5 (523 Hz), E5 (659 Hz), G5 (784 Hz)
    final frequencies = [523.25, 659.25, 783.99];
    for (int i = 0; i < totalSamples; i++) {
      final t = i / sampleRate;
      double sample = 0;
      for (int k = 0; k < frequencies.length; k++) {
        final toneStart = k * 0.16;
        if (t >= toneStart) {
          final toneTime = t - toneStart;
          final decay = exp(-toneTime * 3.5);
          sample += sin(2 * pi * frequencies[k] * toneTime) * decay * 0.35;
        }
      }
      final clamped = (sample.clamp(-1.0, 1.0) * 32767).toInt();
      pcm[i] = clamped;
    }

    // Build 44-byte WAV header
    final byteData = ByteData(44 + pcm.lengthInBytes);
    // RIFF
    byteData.setUint8(0, 0x52); byteData.setUint8(1, 0x49); byteData.setUint8(2, 0x46); byteData.setUint8(3, 0x46);
    byteData.setUint32(4, 36 + pcm.lengthInBytes, Endian.little);
    // WAVE
    byteData.setUint8(8, 0x57); byteData.setUint8(9, 0x41); byteData.setUint8(10, 0x56); byteData.setUint8(11, 0x45);
    // fmt
    byteData.setUint8(12, 0x66); byteData.setUint8(13, 0x6D); byteData.setUint8(14, 0x74); byteData.setUint8(15, 0x20);
    byteData.setUint32(16, 16, Endian.little); // subchunk1 size
    byteData.setUint16(20, 1, Endian.little);  // PCM format
    byteData.setUint16(22, 1, Endian.little);  // mono
    byteData.setUint32(24, sampleRate, Endian.little);
    byteData.setUint32(28, sampleRate * 2, Endian.little); // byte rate
    byteData.setUint16(32, 2, Endian.little); // block align
    byteData.setUint16(34, 16, Endian.little); // bits per sample
    // data
    byteData.setUint8(36, 0x64); byteData.setUint8(37, 0x61); byteData.setUint8(38, 0x74); byteData.setUint8(39, 0x61);
    byteData.setUint32(40, pcm.lengthInBytes, Endian.little);

    // Copy PCM
    final u8Pcm = Uint8List.view(pcm.buffer);
    for (int i = 0; i < u8Pcm.length; i++) {
      byteData.setUint8(44 + i, u8Pcm[i]);
    }

    return byteData.buffer.asUint8List();
  }

  void _startLobbyPolling() {
    _lobbyPollTimer?.cancel();
    _lobbyPollTimer = Timer.periodic(const Duration(seconds: 3), (_) {
      if (mounted) _checkLobbyStatus();
    });
  }

  Future<void> _checkLobbyStatus() async {
    final meetingId = widget.meeting['id'];
    try {
      final client = ref.read(apiClientProvider);
      final res = await client.post('/meetings/$meetingId/join', data: {
        if (widget.passcode != null) 'passcode': widget.passcode,
      });
      final data = res.data as Map<String, dynamic>?;

      if (data?['action'] == 'join') {
        _lobbyPollTimer?.cancel();
        final token = data?['token'] as String?;
        final livekitUrl = data?['livekitUrl'] as String? ?? 'wss://live.learnfrenchwithnatives.com';

        if (token != null && mounted) {
          await _navigateToRoom(token, livekitUrl);
        }
      } else if (data?['action'] == 'declined') {
        _lobbyPollTimer?.cancel();
        if (mounted) {
          setState(() {
            _inLobby = false;
            _errorMessage = context.isFrench
                ? 'L\'enseignant a refusé l\'accès à cette réunion.'
                : 'The host declined access to this meeting.';
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _joinMeeting() async {
    final isFr = context.isFrench;
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    final meetingId = widget.meeting['id'];

    try {
      final client = ref.read(apiClientProvider);
      // Teachers start the meeting or join as host
      final res = await client.post('/meetings/$meetingId/start');
      final data = res.data;

      final token = data?['token'] as String?;
      final livekitUrl = data?['livekitUrl'] as String? ?? 'wss://live.learnfrenchwithnatives.com';

      if (token == null) {
        throw Exception(isFr
            ? 'Impossible de se connecter à la classe.'
            : 'Unable to connect to the class.');
      }

      if (mounted) {
        await _navigateToRoom(token, livekitUrl);
      }
    } catch (e) {
      // If start failed, try join (e.g. participant, or room already active)
      try {
        final client = ref.read(apiClientProvider);
        final res = await client.post('/meetings/$meetingId/join', data: {
          if (widget.passcode != null) 'passcode': widget.passcode,
        });
        final data = res.data;

        if (data?['action'] == 'lobby') {
          if (mounted) {
            setState(() {
              _isLoading = false;
              _inLobby = true;
            });
            _startLobbyPolling();
          }
          return;
        }

        if (data?['action'] == 'declined') {
          if (mounted) {
            setState(() {
              _isLoading = false;
              _errorMessage = isFr
                  ? 'L\'enseignant a refusé votre demande de participation.'
                  : 'The host declined your join request.';
            });
          }
          return;
        }

        final token = data?['token'] as String?;
        final livekitUrl = data?['livekitUrl'] as String? ?? 'wss://live.learnfrenchwithnatives.com';

        if (token == null) {
          throw Exception(isFr
              ? 'Impossible de se connecter à la classe.'
              : 'Unable to connect to the class.');
        }

        if (mounted) {
          await _navigateToRoom(token, livekitUrl);
        }
      } catch (err) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMessage = isFr
                ? 'Impossible de rejoindre la réunion. Vérifiez vos droits d\'accès.'
                : 'Could not join the meeting. Check your permissions.';
          });
        }
      }
    }
  }

  Future<void> _navigateToRoom(String token, String livekitUrl) async {
    // Release preview camera before entering meeting room so room can acquire it
    await _stopCamera();

    if (!mounted) return;
    Navigator.pushReplacement(
      context,
      MaterialPageRoute(
        builder: (context) => MeetingRoomScreen(
          meetingId: widget.meeting['id'],
          title: widget.meeting['title'] ?? (context.isFrench ? 'Classe Virtuelle' : 'Live Class'),
          token: token,
          livekitUrl: livekitUrl,
          initialMicOn: _isMicOn,
          initialCamOn: _isCamOn,
          batchName: widget.meeting['batch_name']?.toString(),
          roomCode: (widget.meeting['code'] ?? widget.meeting['room_name'])?.toString(),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isFr = context.isFrench;
    final title = widget.meeting['title'] ?? (isFr ? 'Classe en direct' : 'Live Class');
    final user = ref.watch(authNotifierProvider).user;
    final userName = user?.fullName.isNotEmpty == true ? user!.fullName : 'Vous';
    final batchName = widget.meeting['batch_name']?.toString();
    final roomCode = (widget.meeting['code'] ?? widget.meeting['room_name'])?.toString();
    final teacherName = '${widget.meeting['teacher_first_name'] ?? ''} ${widget.meeting['teacher_last_name'] ?? ''}'.trim();
    final isHost = user?.role == 'teacher' || user?.role == 'admin';
    final isLive = widget.meeting['status'] == 'active';

    if (_inLobby) {
      return Scaffold(
        backgroundColor: AppColors.frenchPaper,
        body: SafeArea(
          child: Center(
            child: Padding(
              padding: const EdgeInsets.all(32),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 56,
                    height: 56,
                    child: CircularProgressIndicator(
                      color: AppColors.frenchNavy,
                      strokeWidth: 3,
                    ),
                  ),
                  const SizedBox(height: 28),
                  Text(
                    isFr ? 'En salle d\'attente' : 'In the Waiting Room',
                    style: AppTypography.headlineMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.frenchNavy,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    isFr
                        ? 'L\'enseignant a été notifié de votre présence.\nVous entrerez dans la classe dès qu\'il vous aura admis.'
                        : 'The host has been notified.\nYou will join as soon as you are admitted.',
                    textAlign: TextAlign.center,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textMuted,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 36),
                  OutlinedButton.icon(
                    icon: const Icon(Icons.close),
                    label: Text(isFr ? 'Quitter la salle d\'attente' : 'Leave waiting room'),
                    onPressed: () {
                      _lobbyPollTimer?.cancel();
                      Navigator.pop(context);
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    final screenWidth = MediaQuery.of(context).size.width;
    final isTablet = screenWidth >= 800;

    return Scaffold(
      backgroundColor: const Color(0xFF0F172A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.pureWhite),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          isFr ? 'Vérification avant de rejoindre' : 'Pre-join check',
          style: AppTypography.titleSmall.copyWith(color: AppColors.pureWhite.withValues(alpha: 0.8)),
        ),
      ),
      body: SafeArea(
        child: isTablet
            // ── Tablet Landscape Layout (2 columns, matching webapp PreJoin) ──
            ? Padding(
                padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Left Column: Stage Preview + Device Toggles + Mic Visualizer
                    Expanded(
                      flex: 6,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: [
                          Expanded(
                            child: _buildVideoPreviewStage(userName, isFr),
                          ),
                          const SizedBox(height: 16),
                          _buildDeviceSelectorPill(isFr),
                        ],
                      ),
                    ),
                    const SizedBox(width: 32),

                    // Right Column: Meeting Info + Device Checks + Action Button
                    Expanded(
                      flex: 5,
                      child: SingleChildScrollView(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            _buildMeetingHeader(title, teacherName, batchName, roomCode, isHost, isLive, isFr),
                            const SizedBox(height: 16),
                            _buildStatusNote(isHost, isLive, batchName, teacherName, isFr),
                            const SizedBox(height: 16),
                            _buildDeviceChecksCard(isFr),
                            const SizedBox(height: 24),
                            _buildActionButtons(isHost, isLive, isFr),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              )
            // ── Phone Portrait Layout (Stacked) ──
            : SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    _buildVideoPreviewStage(userName, isFr, height: 260),
                    const SizedBox(height: 16),
                    _buildMeetingHeader(title, teacherName, batchName, roomCode, isHost, isLive, isFr),
                    const SizedBox(height: 14),
                    _buildStatusNote(isHost, isLive, batchName, teacherName, isFr),
                    const SizedBox(height: 16),
                    _buildDeviceChecksCard(isFr),
                    const SizedBox(height: 20),
                    _buildActionButtons(isHost, isLive, isFr),
                  ],
                ),
              ),
      ),
    );
  }

  // ── Video Preview Stage (Left Side) ──
  Widget _buildVideoPreviewStage(String userName, bool isFr, {double? height}) {
    return Container(
      height: height,
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.pureWhite.withValues(alpha: 0.12)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.4),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(19),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // 1. Live Camera or Avatar
            if (_isCamOn && _cameraTrack != null)
              SizedBox.expand(
                child: VideoTrackRenderer(_cameraTrack!),
              )
            else if (_isCamOn && _isCameraInitializing)
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(color: AppColors.pureWhite, strokeWidth: 2.5),
                  const SizedBox(height: 14),
                  Text(
                    isFr ? 'Activation de la caméra...' : 'Starting camera...',
                    style: AppTypography.caption.copyWith(color: AppColors.pureWhite),
                  ),
                ],
              )
            else
              Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: AppColors.frenchNavy,
                    child: Text(
                      userName.isNotEmpty ? userName[0].toUpperCase() : '?',
                      style: const TextStyle(fontSize: 34, fontWeight: FontWeight.bold, color: AppColors.pureWhite),
                    ),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    isFr ? 'Votre caméra est désactivée' : 'Your camera is off',
                    style: AppTypography.bodySmall.copyWith(color: AppColors.pureWhite.withValues(alpha: 0.7)),
                  ),
                ],
              ),

            // 2. Top Bar on Preview: User Name + Animated Mic Sound Meter
            Positioned(
              top: 14,
              left: 14,
              right: 14,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: Colors.black.withValues(alpha: 0.6),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          userName,
                          style: AppTypography.caption.copyWith(
                            color: AppColors.pureWhite,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Animated Mic Level Meter
                  if (_isMicOn)
                    AnimatedBuilder(
                      animation: _micAnimController,
                      builder: (context, _) {
                        return Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.6),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.mic, size: 12, color: AppColors.good),
                              const SizedBox(width: 4),
                              _buildSoundBar(8 + (_micAnimController.value * 6)),
                              const SizedBox(width: 2),
                              _buildSoundBar(14 - (_micAnimController.value * 8)),
                              const SizedBox(width: 2),
                              _buildSoundBar(10 + (_micAnimController.value * 4)),
                            ],
                          ),
                        );
                      },
                    )
                  else
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.bad.withValues(alpha: 0.8),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.mic_off, size: 12, color: AppColors.pureWhite),
                          const SizedBox(width: 4),
                          Text(
                            isFr ? 'Coupé' : 'Muted',
                            style: const TextStyle(fontSize: 10, color: AppColors.pureWhite, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),

            // 3. Floating Mic & Camera Round Toggle Buttons
            Positioned(
              bottom: 16,
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildPreviewToggleButton(
                    icon: _isMicOn ? Icons.mic : Icons.mic_off,
                    isOn: _isMicOn,
                    tooltip: _isMicOn
                        ? (isFr ? 'Couper le micro' : 'Mute microphone')
                        : (isFr ? 'Activer le micro' : 'Unmute microphone'),
                    onPressed: _toggleMic,
                  ),
                  const SizedBox(width: 16),
                  _buildPreviewToggleButton(
                    icon: _isCamOn ? Icons.videocam : Icons.videocam_off,
                    isOn: _isCamOn,
                    tooltip: _isCamOn
                        ? (isFr ? 'Désactiver la caméra' : 'Turn off camera')
                        : (isFr ? 'Activer la caméra' : 'Turn on camera'),
                    onPressed: _toggleCam,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSoundBar(double height) {
    return Container(
      width: 3,
      height: height.clamp(4.0, 16.0),
      decoration: BoxDecoration(
        color: AppColors.good,
        borderRadius: BorderRadius.circular(2),
      ),
    );
  }

  Widget _buildPreviewToggleButton({
    required IconData icon,
    required bool isOn,
    required String tooltip,
    required VoidCallback onPressed,
  }) {
    return Tooltip(
      message: tooltip,
      child: InkWell(
        onTap: onPressed,
        borderRadius: BorderRadius.circular(25),
        child: Container(
          width: 50,
          height: 50,
          decoration: BoxDecoration(
            color: isOn
                ? AppColors.pureWhite.withValues(alpha: 0.18)
                : AppColors.bad,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 10,
                offset: const Offset(0, 3),
              ),
            ],
          ),
          child: Icon(icon, color: AppColors.pureWhite, size: 22),
        ),
      ),
    );
  }

  Widget _buildDeviceSelectorPill(bool isFr) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.pureWhite.withValues(alpha: 0.1)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          _buildDeviceStatusItem(
            icon: _isMicOn ? Icons.mic : Icons.mic_off,
            label: isFr ? 'Microphone' : 'Microphone',
            status: _isMicOn ? (isFr ? 'Prêt' : 'Ready') : (isFr ? 'Désactivé' : 'Off'),
            isGood: _isMicOn,
          ),
          Container(width: 1, height: 28, color: AppColors.pureWhite.withValues(alpha: 0.1)),
          _buildDeviceStatusItem(
            icon: _isCamOn ? Icons.videocam : Icons.videocam_off,
            label: isFr ? 'Caméra' : 'Camera',
            status: _isCamOn ? (isFr ? 'Active' : 'Active') : (isFr ? 'Désactivée' : 'Off'),
            isGood: _isCamOn,
          ),
          Container(width: 1, height: 28, color: AppColors.pureWhite.withValues(alpha: 0.1)),
          _buildDeviceStatusItem(
            icon: Icons.volume_up,
            label: isFr ? 'Haut-parleur' : 'Speaker',
            status: isFr ? 'Prêt' : 'Ready',
            isGood: true,
          ),
        ],
      ),
    );
  }

  Widget _buildDeviceStatusItem({
    required IconData icon,
    required String label,
    required String status,
    required bool isGood,
  }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(icon, size: 16, color: isGood ? AppColors.good : AppColors.bad),
        const SizedBox(width: 8),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: AppTypography.caption.copyWith(
                color: AppColors.pureWhite.withValues(alpha: 0.7),
                fontSize: 10,
              ),
            ),
            Text(
              status,
              style: AppTypography.caption.copyWith(
                color: AppColors.pureWhite,
                fontWeight: FontWeight.w700,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ],
    );
  }

  // ── Meeting Header (Right Side) ──
  Widget _buildMeetingHeader(
    String title,
    String teacherName,
    String? batchName,
    String? roomCode,
    bool isHost,
    bool isLive,
    bool isFr,
  ) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          isHost
              ? (isLive ? (isFr ? 'Votre classe en direct' : 'Your live class') : (isFr ? 'Prêt à démarrer ?' : 'Ready to start?'))
              : (isFr ? 'Prêt à rejoindre ?' : 'Ready to join?'),
          style: AppTypography.caption.copyWith(
            color: AppColors.frenchGold,
            fontWeight: FontWeight.w700,
            letterSpacing: 0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          title,
          style: AppTypography.headlineMedium.copyWith(
            color: AppColors.pureWhite,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 10),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            if (teacherName.isNotEmpty)
              _buildMetaPill(Icons.person_outline, isHost ? (isFr ? 'Vous êtes l\'hôte' : 'You are host') : '${isFr ? 'Par' : 'By'} $teacherName'),
            if (batchName != null)
              _buildMetaPill(Icons.groups_outlined, batchName),
            if (roomCode != null)
              _buildMetaPill(Icons.tag, roomCode),
          ],
        ),
      ],
    );
  }

  Widget _buildMetaPill(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.pureWhite.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: AppColors.pureWhite.withValues(alpha: 0.7)),
          const SizedBox(width: 5),
          Text(
            text,
            style: AppTypography.caption.copyWith(
              color: AppColors.pureWhite.withValues(alpha: 0.9),
              fontWeight: FontWeight.w600,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  // ── Status Note Card ──
  Widget _buildStatusNote(bool isHost, bool isLive, String? batchName, String teacherName, bool isFr) {
    Color bg;
    Color border;
    IconData icon;
    String noteTitle;
    String noteText;

    if (isHost) {
      if (isLive) {
        bg = AppColors.good.withValues(alpha: 0.15);
        border = AppColors.good.withValues(alpha: 0.4);
        icon = Icons.play_circle_outline;
        noteTitle = isFr ? 'Votre classe est en cours' : 'Your class is running';
        noteText = isFr ? 'Rejoignez pour reprendre votre enseignement.' : 'Rejoin to continue teaching.';
      } else {
        bg = AppColors.frenchBlue.withValues(alpha: 0.15);
        border = AppColors.frenchBlue.withValues(alpha: 0.3);
        icon = Icons.school_outlined;
        noteTitle = isFr ? 'Vos étudiants vous attendent' : 'Your students are waiting';
        noteText = batchName != null
            ? (isFr ? 'Les étudiants de $batchName rejoindront automatiquement dès le démarrage.' : 'Students from $batchName will join automatically once started.')
            : (isFr ? 'Les participants demanderont à entrer et vous les validerez.' : 'Participants will request entry for your approval.');
      }
    } else {
      if (isLive) {
        bg = AppColors.good.withValues(alpha: 0.15);
        border = AppColors.good.withValues(alpha: 0.4);
        icon = Icons.sensors;
        noteTitle = isFr ? 'La classe est en direct' : 'Class is live';
        noteText = teacherName.isNotEmpty
            ? (isFr ? '$teacherName est dans la salle.' : '$teacherName is in the room.')
            : (isFr ? 'L\'enseignant est dans la salle.' : 'The host is in the room.');
      } else {
        bg = AppColors.frenchGoldBg.withValues(alpha: 0.8);
        border = AppColors.frenchGold.withValues(alpha: 0.4);
        icon = Icons.schedule;
        noteTitle = isFr ? 'Préparez-vous' : 'Get ready';
        noteText = isFr ? 'Vérifiez vos périphériques puis rejoignez la classe.' : 'Check your devices and enter the class.';
      }
    }

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: AppColors.pureWhite, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  noteTitle,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.pureWhite,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  noteText,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.pureWhite.withValues(alpha: 0.8),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Device Checks Card with Speaker "Test" Button ──
  Widget _buildDeviceChecksCard(bool isFr) {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1E293B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.pureWhite.withValues(alpha: 0.1)),
      ),
      child: Column(
        children: [
          // Camera Check
          _buildCheckTile(
            icon: _isCamOn ? Icons.videocam : Icons.videocam_off,
            title: isFr ? 'Caméra' : 'Camera',
            subtitle: _isCamOn
                ? (isFr ? 'Fonctionne correctement' : 'Working properly')
                : (isFr ? 'Caméra désactivée' : 'Camera is off'),
            isOk: _isCamOn,
          ),
          Divider(height: 1, color: AppColors.pureWhite.withValues(alpha: 0.08)),

          // Mic Check
          _buildCheckTile(
            icon: _isMicOn ? Icons.mic : Icons.mic_off,
            title: isFr ? 'Microphone' : 'Microphone',
            subtitle: _isMicOn
                ? (isFr ? 'Prêt · Dites quelque chose pour tester' : 'Ready · Say something to test')
                : (isFr ? 'Microphone coupé' : 'Microphone muted'),
            isOk: _isMicOn,
          ),
          Divider(height: 1, color: AppColors.pureWhite.withValues(alpha: 0.08)),

          // Speaker Check with "Tester" button
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Icon(
                  Icons.volume_up,
                  size: 20,
                  color: _isPlayingTestSound ? AppColors.frenchGold : AppColors.good,
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        isFr ? 'Haut-parleur' : 'Speaker',
                        style: AppTypography.bodySmall.copyWith(
                          color: AppColors.pureWhite,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      Text(
                        _isPlayingTestSound
                            ? (isFr ? 'Lecture du son test...' : 'Playing test chime...')
                            : (isFr ? 'Jouer un son pour vérifier' : 'Play a sound to check'),
                        style: AppTypography.caption.copyWith(
                          color: _isPlayingTestSound ? AppColors.frenchGold : AppColors.pureWhite.withValues(alpha: 0.6),
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _isPlayingTestSound
                        ? AppColors.frenchGold
                        : AppColors.pureWhite.withValues(alpha: 0.15),
                    foregroundColor: AppColors.pureWhite,
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                    visualDensity: VisualDensity.compact,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                  onPressed: _isPlayingTestSound ? null : _testSpeaker,
                  child: _isPlayingTestSound
                      ? const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(color: AppColors.pureWhite, strokeWidth: 2),
                        )
                      : Text(
                          isFr ? 'Tester' : 'Test',
                          style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 12),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required bool isOk,
  }) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: isOk ? AppColors.good : AppColors.bad),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.pureWhite,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                Text(
                  subtitle,
                  style: AppTypography.caption.copyWith(
                    color: AppColors.pureWhite.withValues(alpha: 0.6),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          Container(
            width: 8,
            height: 8,
            decoration: BoxDecoration(
              color: isOk ? AppColors.good : AppColors.bad,
              shape: BoxShape.circle,
            ),
          ),
        ],
      ),
    );
  }

  // ── Action Buttons ──
  Widget _buildActionButtons(bool isHost, bool isLive, bool isFr) {
    final primaryLabel = isHost
        ? (isLive ? (isFr ? 'Rejoindre la classe' : 'Rejoin class') : (isFr ? 'Démarrer la classe' : 'Start class'))
        : (isFr ? 'Rejoindre maintenant' : 'Join now');

    return Column(
      children: [
        if (_errorMessage != null) ...[
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.bad.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.bad),
            ),
            child: Text(
              _errorMessage!,
              style: AppTypography.caption.copyWith(color: AppColors.pureWhite, fontWeight: FontWeight.w600),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(height: 14),
        ],
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF047857), // emerald green matching webapp
              foregroundColor: AppColors.pureWhite,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              elevation: 4,
            ),
            icon: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(color: AppColors.pureWhite, strokeWidth: 2),
                  )
                : const Icon(Icons.video_call, size: 22),
            label: Text(
              _isLoading
                  ? (isFr ? 'Connexion à la classe...' : 'Connecting to class...')
                  : primaryLabel,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.pureWhite,
                fontWeight: FontWeight.w700,
              ),
            ),
            onPressed: _isLoading ? null : _joinMeeting,
          ),
        ),
        const SizedBox(height: 10),
        SizedBox(
          width: double.infinity,
          height: 44,
          child: OutlinedButton(
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.pureWhite.withValues(alpha: 0.8),
              side: BorderSide(color: AppColors.pureWhite.withValues(alpha: 0.2)),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            onPressed: () => Navigator.pop(context),
            child: Text(
              isFr ? 'Retour aux réunions' : 'Back to meetings',
              style: AppTypography.bodySmall.copyWith(
                color: AppColors.pureWhite.withValues(alpha: 0.8),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ),
      ],
    );
  }
}
