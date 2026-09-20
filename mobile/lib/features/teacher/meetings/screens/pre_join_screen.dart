import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/auth/auth_notifier.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_typography.dart';
import '../../../../core/widgets/custom_button.dart';
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

class _PreJoinScreenState extends ConsumerState<PreJoinScreen> {
  bool _isMicOn = true;
  bool _isCamOn = true;
  bool _isLoading = false;
  bool _inLobby = false;
  Timer? _lobbyPollTimer;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _requestPermissions();
  }

  @override
  void dispose() {
    _lobbyPollTimer?.cancel();
    super.dispose();
  }

  Future<void> _requestPermissions() async {
    try {
      await [Permission.camera, Permission.microphone].request();
    } catch (_) {}
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
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => MeetingRoomScreen(
                meetingId: meetingId,
                title: widget.meeting['title'] ?? 'Classe Virtuelle',
                token: token,
                livekitUrl: livekitUrl,
                initialMicOn: _isMicOn,
                initialCamOn: _isCamOn,
              ),
            ),
          );
        }
      } else if (data?['action'] == 'declined') {
        _lobbyPollTimer?.cancel();
        if (mounted) {
          setState(() {
            _inLobby = false;
            _errorMessage = 'L\'enseignant a refusé l\'accès à cette réunion.';
          });
        }
      }
    } catch (_) {}
  }

  Future<void> _joinMeeting() async {
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
        throw Exception('Token LiveKit manquant.');
      }

      if (mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(
            builder: (context) => MeetingRoomScreen(
              meetingId: meetingId,
              title: widget.meeting['title'] ?? 'Classe Virtuelle',
              token: token,
              livekitUrl: livekitUrl,
              initialMicOn: _isMicOn,
              initialCamOn: _isCamOn,
            ),
          ),
        );
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
              _errorMessage = 'L\'enseignant a refusé votre demande de participation.';
            });
          }
          return;
        }

        final token = data?['token'] as String?;
        final livekitUrl = data?['livekitUrl'] as String? ?? 'wss://live.learnfrenchwithnatives.com';

        if (token == null) throw Exception('Token non reçu.');

        if (mounted) {
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(
              builder: (context) => MeetingRoomScreen(
                meetingId: meetingId,
                title: widget.meeting['title'] ?? 'Classe Virtuelle',
                token: token,
                livekitUrl: livekitUrl,
                initialMicOn: _isMicOn,
                initialCamOn: _isCamOn,
              ),
            ),
          );
        }
      } catch (err) {
        if (mounted) {
          setState(() {
            _isLoading = false;
            _errorMessage = 'Impossible de rejoindre la réunion. Vérifiez vos droits d\'accès.';
          });
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.meeting['title'] ?? 'Classe en direct';
    final user = ref.watch(authNotifierProvider).user;

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
                    'En salle d\'attente',
                    style: AppTypography.headlineMedium.copyWith(
                      fontWeight: FontWeight.w700,
                      color: AppColors.frenchNavy,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(
                    'L\'enseignant a été notifié de votre présence.\nVous entrerez dans la classe dès qu\'il vous aura admis.',
                    textAlign: TextAlign.center,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textMuted,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 36),
                  OutlinedButton.icon(
                    icon: const Icon(Icons.close),
                    label: const Text('Quitter la salle d\'attente'),
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

    return Scaffold(
      backgroundColor: AppColors.frenchNavyDark,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppColors.pureWhite),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 480),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Meeting Title
                Text(
                  title,
                  style: AppTypography.headlineMedium.copyWith(
                    color: AppColors.pureWhite,
                    fontWeight: FontWeight.w700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 6),
                Text(
                  'Préparez votre caméra et micro avant d\'entrer',
                  style: AppTypography.bodySmall.copyWith(
                    color: AppColors.pureWhite.withValues(alpha: 0.7),
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 28),

                // Video Stage Preview Card
                Container(
                  width: double.infinity,
                  height: 260,
                  decoration: BoxDecoration(
                    color: const Color(0xFF1E293B),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.pureWhite.withValues(alpha: 0.15)),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.4),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      if (_isCamOn)
                        Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.videocam, size: 48, color: AppColors.frenchBlueLight),
                            const SizedBox(height: 10),
                            Text(
                              'Caméra prête',
                              style: AppTypography.bodyMedium.copyWith(
                                color: AppColors.pureWhite,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        )
                      else
                        CircleAvatar(
                          radius: 44,
                          backgroundColor: AppColors.frenchNavy,
                          child: Text(
                            user?.fullName.isNotEmpty == true ? user!.fullName[0].toUpperCase() : 'P',
                            style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppColors.pureWhite),
                          ),
                        ),
                      // Floating Mic & Cam Toggles on Preview
                      Positioned(
                        bottom: 16,
                        child: Row(
                          children: [
                            _buildToggle(
                              icon: _isMicOn ? Icons.mic : Icons.mic_off,
                              isOn: _isMicOn,
                              onPressed: () => setState(() => _isMicOn = !_isMicOn),
                            ),
                            const SizedBox(width: 16),
                            _buildToggle(
                              icon: _isCamOn ? Icons.videocam : Icons.videocam_off,
                              isOn: _isCamOn,
                              onPressed: () => setState(() => _isCamOn = !_isCamOn),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                if (_errorMessage != null) ...[
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.badBg,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppColors.badBorder),
                    ),
                    child: Text(
                      _errorMessage!,
                      style: AppTypography.caption.copyWith(color: AppColors.bad, fontWeight: FontWeight.w600),
                      textAlign: TextAlign.center,
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // Action Button
                CustomButton(
                  text: _isLoading ? 'Connexion à la salle...' : 'Démarrer le cours en direct',
                  icon: Icons.video_call,
                  height: 52,
                  width: double.infinity,
                  isLoading: _isLoading,
                  onPressed: _joinMeeting,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildToggle({required IconData icon, required bool isOn, required VoidCallback onPressed}) {
    return InkWell(
      onTap: onPressed,
      borderRadius: BorderRadius.circular(24),
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: isOn ? AppColors.pureWhite.withValues(alpha: 0.2) : AppColors.bad,
          shape: BoxShape.circle,
        ),
        child: Icon(icon, color: AppColors.pureWhite, size: 22),
      ),
    );
  }
}
