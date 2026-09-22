import 'package:flutter/foundation.dart';
import 'package:flutter_background/flutter_background.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart' show Helper;
import 'package:livekit_client/livekit_client.dart';

enum ScreenShareToggleResult { started, stopped, cancelled, failed }

class LiveKitMeetingController extends ChangeNotifier {
  Room? _room;
  bool _isConnecting = false;
  bool _isConnected = false;
  String? _errorMessage;

  bool _isMicOn = true;
  bool _isCamOn = true;
  bool _isHandRaised = false;

  Room? get room => _room;
  bool get isConnecting => _isConnecting;
  bool get isConnected => _isConnected;
  String? get errorMessage => _errorMessage;

  bool get isMicOn => _isMicOn;
  bool get isCamOn => _isCamOn;
  bool get isHandRaised => _isHandRaised;

  // ── Connection quality ──
  ConnectionQuality _connectionQuality = ConnectionQuality.unknown;
  ConnectionQuality get connectionQuality => _connectionQuality;

  // ── Screen share detection ──
  bool get hasRemoteScreenShare {
    if (_room == null) return false;
    for (final p in _room!.remoteParticipants.values) {
      for (final pub in p.trackPublications.values) {
        if (pub.source == TrackSource.screenShareVideo &&
            !pub.muted &&
            pub.subscribed) {
          return true;
        }
      }
    }
    return false;
  }

  RemoteParticipant? get screenShareParticipant {
    if (_room == null) return null;
    for (final p in _room!.remoteParticipants.values) {
      for (final pub in p.trackPublications.values) {
        if (pub.source == TrackSource.screenShareVideo &&
            !pub.muted &&
            pub.subscribed) {
          return p;
        }
      }
    }
    return null;
  }

  VideoTrack? get screenShareTrack {
    final p = screenShareParticipant;
    if (p == null) return null;
    for (final pub in p.trackPublications.values) {
      if (pub.source == TrackSource.screenShareVideo &&
          pub.track is VideoTrack) {
        return pub.track as VideoTrack;
      }
    }
    return null;
  }

  List<Participant> get allParticipants {
    final list = <Participant>[];
    if (_room?.localParticipant != null) {
      list.add(_room!.localParticipant!);
    }
    if (_room != null) {
      list.addAll(_room!.remoteParticipants.values);
    }
    return list;
  }

  Future<void> connect({
    required String url,
    required String token,
    bool startWithMic = true,
    bool startWithCam = true,
  }) async {
    _isConnecting = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final roomOptions = const RoomOptions(
        adaptiveStream: true,
        dynacast: true,
        defaultVideoPublishOptions: VideoPublishOptions(simulcast: true),
      );

      _room = Room(roomOptions: roomOptions);

      // Listen to room events
      _room!.addListener(_onRoomUpdate);

      _room!.events.listen((_) {
        _onRoomUpdate();
      });

      await _room!.connect(url, token);

      _isMicOn = startWithMic;
      _isCamOn = startWithCam;

      if (_isMicOn) {
        await _room!.localParticipant?.setMicrophoneEnabled(true);
      }
      if (_isCamOn) {
        await _room!.localParticipant?.setCameraEnabled(true);
      }

      // Update connection quality from local participant
      _updateConnectionQuality();

      _isConnected = true;
      _isConnecting = false;
      notifyListeners();
    } catch (e) {
      _isConnected = false;
      _isConnecting = false;
      // Sanitize error message — never expose LiveKit/WebRTC internals
      _errorMessage = _sanitizeError(e);
      notifyListeners();
    }
  }

  void _updateConnectionQuality() {
    final lp = _room?.localParticipant;
    if (lp != null) {
      _connectionQuality = lp.connectionQuality;
    }
  }

  String _sanitizeError(dynamic e) {
    final raw = e.toString().toLowerCase();
    if (raw.contains('timeout') || raw.contains('timed out')) {
      return 'La connexion a expiré. Veuillez vérifier votre connexion internet et réessayer.';
    }
    if (raw.contains('network') ||
        raw.contains('socket') ||
        raw.contains('connection')) {
      return 'Impossible de se connecter à la classe. Vérifiez votre connexion internet.';
    }
    if (raw.contains('permission') || raw.contains('denied')) {
      return 'Accès à la caméra ou au microphone refusé. Veuillez autoriser l\'accès dans les paramètres.';
    }
    return 'Impossible de rejoindre la classe. Veuillez réessayer.';
  }

  bool _isScreenSharing = false;
  bool _isScreenShareBusy = false;
  bool get isScreenSharing => _isScreenSharing;
  bool get isScreenShareBusy => _isScreenShareBusy;

  void _onRoomUpdate() {
    _updateConnectionQuality();
    final lp = _room?.localParticipant;
    if (lp != null) {
      _isScreenSharing = lp.trackPublications.values.any(
        (pub) => pub.source == TrackSource.screenShareVideo && !pub.muted,
      );
    }
    notifyListeners();
  }

  Future<ScreenShareToggleResult> toggleScreenShare() async {
    if (_room?.localParticipant == null || _isScreenShareBusy) {
      return ScreenShareToggleResult.failed;
    }

    _isScreenShareBusy = true;
    notifyListeners();

    final shouldStart = !_isScreenSharing;
    try {
      if (shouldStart && defaultTargetPlatform == TargetPlatform.android) {
        // Let Android offer both entire-screen and single-app sharing. The
        // foreground media-projection service below keeps the meeting alive
        // when the selected app moves this activity to the background.
        final hasCapturePermission = await Helper.requestCapturePermission(
          fullScreenOnly: false,
        );
        if (!hasCapturePermission) {
          return ScreenShareToggleResult.cancelled;
        }

        final backgroundReady = await _enableAndroidProjectionService();
        if (!backgroundReady) {
          return ScreenShareToggleResult.failed;
        }
      }

      await _room!.localParticipant!.setScreenShareEnabled(shouldStart);
      _isScreenSharing = shouldStart;
      notifyListeners();
      if (!shouldStart) {
        await _disableAndroidProjectionService();
      }
      return shouldStart
          ? ScreenShareToggleResult.started
          : ScreenShareToggleResult.stopped;
    } catch (e) {
      debugPrint('[LiveKit] Screen share error: $e');
      if (shouldStart) {
        await _disableAndroidProjectionService();
      }
      _isScreenSharing = false;
      return ScreenShareToggleResult.failed;
    } finally {
      _isScreenShareBusy = false;
      notifyListeners();
    }
  }

  Future<bool> _enableAndroidProjectionService() async {
    if (defaultTargetPlatform != TargetPlatform.android) return true;

    try {
      const androidConfig = FlutterBackgroundAndroidConfig(
        notificationTitle: 'Screen sharing is active',
        notificationText: 'Learn French with Natives is sharing your screen.',
        notificationImportance: AndroidNotificationImportance.normal,
        notificationIcon: AndroidResource(
          name: 'ic_launcher',
          defType: 'mipmap',
        ),
        showBadge: false,
        // A foreground media-projection service is sufficient here. Opening
        // Android's battery-settings screen would interrupt the share flow
        // and make the meeting appear to have closed.
        shouldRequestBatteryOptimizationsOff: false,
      );
      final initialized = await FlutterBackground.initialize(
        androidConfig: androidConfig,
      );
      if (!initialized) return false;
      if (FlutterBackground.isBackgroundExecutionEnabled) return true;
      return await FlutterBackground.enableBackgroundExecution();
    } catch (e) {
      debugPrint('[LiveKit] Could not start media projection service: $e');
      return false;
    }
  }

  Future<void> _disableAndroidProjectionService() async {
    if (defaultTargetPlatform != TargetPlatform.android ||
        !FlutterBackground.isBackgroundExecutionEnabled) {
      return;
    }
    try {
      await FlutterBackground.disableBackgroundExecution();
    } catch (e) {
      debugPrint('[LiveKit] Could not stop media projection service: $e');
    }
  }

  Future<void> toggleMicrophone() async {
    if (_room?.localParticipant == null) return;
    _isMicOn = !_isMicOn;
    await _room!.localParticipant?.setMicrophoneEnabled(_isMicOn);
    notifyListeners();
  }

  Future<void> toggleCamera() async {
    if (_room?.localParticipant == null) return;
    _isCamOn = !_isCamOn;
    await _room!.localParticipant?.setCameraEnabled(_isCamOn);
    notifyListeners();
  }

  CameraPosition _cameraPosition = CameraPosition.front;
  CameraPosition get cameraPosition => _cameraPosition;

  Future<void> flipCamera() async {
    final track =
        _room?.localParticipant?.videoTrackPublications.firstOrNull?.track;
    if (track is LocalVideoTrack) {
      try {
        final newPosition = _cameraPosition.switched();
        await track.setCameraPosition(newPosition);
        _cameraPosition = newPosition;
        notifyListeners();
      } catch (_) {}
    }
  }

  void toggleHandRaise() {
    _isHandRaised = !_isHandRaised;
    notifyListeners();
  }

  void setHandRaised(bool raised) {
    _isHandRaised = raised;
    notifyListeners();
  }

  Future<void> leaveRoom() async {
    try {
      await _disableAndroidProjectionService();
      await _room?.disconnect();
      await _room?.dispose();
    } catch (_) {}
    _room = null;
    _isConnected = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _disableAndroidProjectionService();
    _room?.removeListener(_onRoomUpdate);
    _room?.disconnect();
    _room?.dispose();
    super.dispose();
  }
}
