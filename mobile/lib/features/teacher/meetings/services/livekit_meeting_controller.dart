import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:flutter_webrtc/flutter_webrtc.dart' show Helper;
import 'package:livekit_client/livekit_client.dart';

enum ScreenShareToggleResult { started, stopped, cancelled, failed }

/// Why the class could not be (re)joined. The screen turns it into text.
enum MeetingConnectionError { timeout, network, permission, lost, generic }

/// Why the class was closed by the server rather than by this user.
enum MeetingExitReason {
  /// The teacher removed this participant.
  removed,

  /// The same account joined the class from another device.
  joinedElsewhere,

  /// The LiveKit room was closed, i.e. the class is over.
  ended,
}

/// Obtains a fresh LiveKit token for the current class. Returns null when no
/// token can be obtained right now (the previous one is then reused).
typedef MeetingTokenProvider = Future<String?> Function();

class LiveKitMeetingController extends ChangeNotifier {
  static const MethodChannel _meetingService = MethodChannel(
    'learnfrenchwithnatives/meeting_service',
  );

  static const _cameraCapture = CameraCaptureOptions(
    params: VideoParametersPresets.h540_169,
    maxFrameRate: 25,
  );

  static const _roomOptions = RoomOptions(
    adaptiveStream: true,
    dynacast: true,
    // The SDK's default 720p/30 camera can use ~1.7 Mbps before screen
    // sharing starts. Leave uplink headroom for the presentation stream.
    defaultCameraCaptureOptions: _cameraCapture,
    // 1080p is the SDK default, but it is unnecessarily expensive on a
    // phone uplink and makes shared motion lag behind. A 720p source plus
    // a low simulcast layer lets receivers adapt without stalling.
    defaultScreenShareCaptureOptions: ScreenShareCaptureOptions(
      params: VideoParametersPresets.screenShareH720FPS15,
      maxFrameRate: 15,
    ),
    defaultVideoPublishOptions: VideoPublishOptions(
      simulcast: true,
      screenShareEncoding: VideoEncoding(maxBitrate: 1500000, maxFramerate: 15),
      screenShareSimulcastLayers: [VideoParametersPresets.screenShareH360FPS3],
      degradationPreference: DegradationPreference.balanced,
    ),
  );

  /// Automatic rejoin attempts after LiveKit gave up (about 2.5 minutes).
  static const _maxRejoinAttempts = 12;

  LiveKitMeetingController() {
    if (_isAndroid) {
      _serviceOwner = this;
      _meetingService.setMethodCallHandler(_onServiceCall);
    }
  }

  /// The controller that receives the service's callbacks (one class at a time).
  static LiveKitMeetingController? _serviceOwner;

  Room? _room;
  EventsListener<RoomEvent>? _roomEvents;
  bool _isConnecting = false;
  bool _isConnected = false;
  bool _isReconnecting = false;
  bool _isDisposed = false;
  bool _left = false;
  bool _intentionalDisconnect = false;
  MeetingConnectionError? _error;
  MeetingExitReason? _exitReason;
  String? _lastUrl;
  String? _lastToken;

  /// Supplies fresh tokens for automatic rejoins. Set by the class screen.
  MeetingTokenProvider? tokenProvider;

  /// Called when the user taps "Leave" in the class notification.
  VoidCallback? onLeaveRequested;

  Timer? _rejoinTimer;
  int _rejoinAttempt = 0;
  bool _rejoinInFlight = false;
  Future<void>? _foregroundRecovery;

  bool _isMicOn = true;
  bool _isCamOn = true;
  bool _isHandRaised = false;
  bool _cameraPausedForBackground = false;
  Map<String, String>? _serviceLabels;

  Room? get room => _room;
  bool get isConnecting => _isConnecting;
  bool get isConnected => _isConnected;
  bool get isReconnecting => _isReconnecting;
  MeetingConnectionError? get connectionError => _error;
  MeetingExitReason? get exitReason => _exitReason;

  bool get isMicOn => _isMicOn;
  bool get isCamOn => _isCamOn;
  bool get isHandRaised => _isHandRaised;

  bool get _isAndroid =>
      !kIsWeb && defaultTargetPlatform == TargetPlatform.android;

  // ── Connection quality ──
  ConnectionQuality _connectionQuality = ConnectionQuality.unknown;
  ConnectionQuality get connectionQuality => _connectionQuality;

  // ── Active speaker (for the picture-in-picture window) ──
  String? _lastRemoteSpeaker;

  /// Identity of the remote participant who spoke most recently.
  String? get lastRemoteSpeakerIdentity => _lastRemoteSpeaker;

  // ── Remote presentation ──

  /// The remote screen share to show, even while its video is still being
  /// subscribed (so the stage switches at once and shows a loading state).
  RemoteTrackPublication? get _presentation {
    final room = _room;
    if (room == null) return null;
    RemoteTrackPublication? pending;
    for (final p in room.remoteParticipants.values) {
      for (final pub in p.trackPublications.values) {
        if (pub.source != TrackSource.screenShareVideo || pub.muted) continue;
        if (pub.subscribed && pub.track is VideoTrack) return pub;
        pending ??= pub;
      }
    }
    return pending;
  }

  bool get hasRemoteScreenShare => _presentation != null;

  RemoteParticipant? get screenShareParticipant => _presentation?.participant;

  /// The presentation video, or null while it is still being subscribed.
  VideoTrack? get screenShareTrack {
    final track = _presentation?.track;
    return track is RemoteVideoTrack ? track : null;
  }

  List<Participant> get allParticipants {
    final room = _room;
    if (room == null) return const [];
    return [
      if (room.localParticipant != null) room.localParticipant!,
      ...room.remoteParticipants.values,
    ];
  }

  /// Texts of the Android "class in progress" notification.
  void setServiceLabels(Map<String, String> labels) {
    _serviceLabels = labels;
    if (_isConnected) unawaited(_updateAndroidCallService());
  }

  Future<void> connect({
    required String url,
    required String token,
    bool startWithMic = true,
    bool startWithCam = true,
  }) async {
    if (_isDisposed) return;
    _lastUrl = url;
    _lastToken = token;
    _isMicOn = startWithMic;
    _isCamOn = startWithCam;
    _left = false;
    _exitReason = null;
    await _connectRoom(url: url, token: token);
  }

  /// Retry button of the error state: joins again with a fresh token.
  Future<void> retry() async {
    if (_isDisposed || _left) return;
    _rejoinTimer?.cancel();
    _rejoinTimer = null;
    _rejoinAttempt = 0;
    final token = await _freshToken();
    final url = _lastUrl;
    if (url == null || _isDisposed || _left) return;
    await _connectRoom(url: url, token: token ?? _lastToken ?? '');
  }

  Future<bool> _connectRoom({
    required String url,
    required String token,
    bool rejoin = false,
  }) async {
    if (_isDisposed || _left) return false;
    if (rejoin) {
      _isReconnecting = true;
    } else {
      _isConnecting = true;
      _isReconnecting = false;
    }
    _error = null;
    _safeNotify();

    try {
      // A capture cannot survive a new room: Android wants a fresh consent.
      if (_isScreenSharing) {
        _isScreenSharing = false;
        await _setProjection(false);
      }
      await _releaseRoom(disconnect: true);

      final room = Room(roomOptions: _roomOptions);
      _room = room;
      room.addListener(_onRoomUpdate);
      _roomEvents = room.createListener()
        ..listen((event) => _onRoomEvent(room, event));

      await room.connect(url, token);
      if (_isDisposed || _left || _room != room) {
        await _discard(room);
        return false;
      }

      await _publishMedia(room);
      _updateConnectionQuality();
      _isConnected = true;
      _isConnecting = false;
      _isReconnecting = false;
      _error = null;
      _rejoinAttempt = 0;
      await _updateAndroidCallService();
      // Someone may already be presenting (joining late or rejoining).
      _watchPresentation();
      _safeNotify();
      return true;
    } catch (e) {
      debugPrint('[LiveKit] Connect failed: $e');
      await _releaseRoom(disconnect: true);
      _isConnected = false;
      _isConnecting = false;
      if (!rejoin) {
        _isReconnecting = false;
        _error = _classifyError(e);
      }
      _safeNotify();
      return false;
    }
  }

  Future<void> _publishMedia(Room room) async {
    final participant = room.localParticipant;
    if (participant == null) return;
    if (_isMicOn) {
      try {
        await participant.setMicrophoneEnabled(true);
      } catch (e) {
        debugPrint('[LiveKit] Microphone unavailable: $e');
        _isMicOn = false;
      }
    }
    if (_isCamOn && !_cameraPausedForBackground) {
      try {
        await participant.setCameraEnabled(
          true,
          cameraCaptureOptions: _cameraCapture.copyWith(
            cameraPosition: _cameraPosition,
          ),
        );
      } catch (e) {
        debugPrint('[LiveKit] Camera unavailable: $e');
        _isCamOn = false;
      }
    }
  }

  Future<void> _discard(Room room) async {
    try {
      await room.disconnect();
    } catch (_) {}
    try {
      await room.dispose();
    } catch (_) {}
  }

  void _onRoomEvent(Room source, RoomEvent event) {
    if (_isDisposed || _room != source) return;
    switch (event) {
      case RoomReconnectingEvent():
        _isReconnecting = true;
      case RoomReconnectedEvent():
        _isConnected = true;
        _isReconnecting = false;
        _error = null;
        // A resumed or restarted transport needs a fresh key frame before
        // a static slide shows again.
        _watchPresentation(kick: true);
      case RoomDisconnectedEvent(:final reason):
        if (!_intentionalDisconnect) _onUnexpectedDisconnect(reason);
      case ActiveSpeakersChangedEvent(:final speakers):
        for (final speaker in speakers) {
          if (speaker is RemoteParticipant) {
            _lastRemoteSpeaker = speaker.identity;
            break;
          }
        }
      case ParticipantDisconnectedEvent(:final participant):
        if (_lastRemoteSpeaker == participant.identity) {
          _lastRemoteSpeaker = null;
        }
        _watchPresentation();
      case TrackSubscribedEvent(:final publication):
        if (publication.source == TrackSource.screenShareVideo) {
          _watchPresentation();
        }
      case TrackPublishedEvent(:final publication):
      case TrackUnpublishedEvent(:final publication):
      case TrackUnsubscribedEvent(:final publication):
        if (publication.source == TrackSource.screenShareVideo) {
          _watchPresentation();
        }
      case TrackMutedEvent(:final publication):
      case TrackUnmutedEvent(:final publication):
        if (publication.source == TrackSource.screenShareVideo &&
            publication is RemoteTrackPublication) {
          _watchPresentation();
        }
      case TrackSubscriptionExceptionEvent(:final sid):
        if (sid != null && sid == _watchedPresentationSid) {
          _presentationTimer?.cancel();
          _presentationTimer = Timer(
            const Duration(milliseconds: 1500),
            _watchPresentation,
          );
        }
      default:
        break;
    }
    _onRoomUpdate();
  }

  void _onUnexpectedDisconnect(DisconnectReason? reason) {
    _isConnected = false;
    _presentationTimer?.cancel();
    final exit = switch (reason) {
      DisconnectReason.participantRemoved => MeetingExitReason.removed,
      DisconnectReason.duplicateIdentity => MeetingExitReason.joinedElsewhere,
      DisconnectReason.roomDeleted => MeetingExitReason.ended,
      _ => null,
    };
    if (exit != null) {
      // Terminal: rejoining would either fail or kick the other device.
      _exitReason = exit;
      _isReconnecting = false;
      unawaited(_shutdown());
      return;
    }
    // LiveKit already exhausted its own resume and reconnect attempts.
    _scheduleRejoin(immediate: true);
  }

  // ── Automatic rejoin ──

  void _scheduleRejoin({bool immediate = false}) {
    if (_left || _isDisposed || _rejoinInFlight || _rejoinTimer != null) {
      return;
    }
    _isReconnecting = true;
    _error = null;
    _safeNotify();
    final delay = immediate
        ? Duration.zero
        : Duration(
            milliseconds: math.min(15000, 1000 * (1 << math.min(_rejoinAttempt, 4))),
          );
    _rejoinTimer = Timer(delay, () {
      _rejoinTimer = null;
      unawaited(_rejoin());
    });
  }

  Future<void> _rejoin() async {
    final url = _lastUrl;
    if (_left || _isDisposed || _rejoinInFlight || url == null) return;
    _rejoinInFlight = true;
    _rejoinAttempt++;
    var joined = false;
    try {
      final token = await _freshToken();
      if (_left || _isDisposed) return;
      if (token != null) _lastToken = token;
      joined = await _connectRoom(
        url: url,
        token: _lastToken ?? '',
        rejoin: true,
      );
    } finally {
      _rejoinInFlight = false;
    }
    if (joined || _left || _isDisposed) return;
    if (_rejoinAttempt >= _maxRejoinAttempts) {
      _isReconnecting = false;
      _error = MeetingConnectionError.lost;
      _safeNotify();
      return;
    }
    _scheduleRejoin();
  }

  Future<String?> _freshToken() async {
    final provider = tokenProvider;
    if (provider == null) return null;
    try {
      final token = await provider();
      return token == null || token.isEmpty ? null : token;
    } catch (e) {
      debugPrint('[LiveKit] Could not refresh the class token: $e');
      return null;
    }
  }

  // ── App lifecycle ──

  /// The app is no longer visible at all (another app, home screen without
  /// picture-in-picture, screen locked).
  ///
  /// The camera is paused: Android does not reliably let a hidden app keep
  /// it, and a frozen picture is worse than the avatar. The microphone keeps
  /// working through the foreground service.
  Future<void> onAppHidden() async {
    if (_left || _isDisposed) return;
    if (!_isCamOn || _cameraPausedForBackground) return;
    // Also honoured by a rejoin that happens while the app is hidden.
    _cameraPausedForBackground = true;
    final participant = _room?.localParticipant;
    if (participant == null) return;
    try {
      await participant.setCameraEnabled(false);
    } catch (e) {
      debugPrint('[LiveKit] Could not pause the camera: $e');
    }
    await _updateAndroidCallService();
  }

  /// The app is visible again (full screen or picture-in-picture). Repairs
  /// whatever Android interrupted without tearing the class down.
  Future<void> onAppVisible({required Duration away}) {
    final running = _foregroundRecovery;
    if (running != null) return running;
    final recovery = _recoverOnForeground(away).whenComplete(() {
      _foregroundRecovery = null;
    });
    _foregroundRecovery = recovery;
    return recovery;
  }

  Future<void> _recoverOnForeground(Duration away) async {
    if (_left || _isDisposed) return;
    final resumedCamera = await _resumeCamera();

    final room = _room;
    if (room == null) {
      if (!_isConnecting && _lastUrl != null && _error == null) {
        _scheduleRejoin(immediate: true);
      }
      return;
    }
    switch (room.connectionState) {
      case ConnectionState.connected:
        if (away < const Duration(milliseconds: 800)) return;
        // Android drops the video surfaces of a hidden app. A camera repaints
        // them within a frame, a static slide never does: ask the presenter
        // for a new key frame.
        _watchPresentation(kick: true);
        if (!resumedCamera) unawaited(_healLocalCamera());
        if (away >= const Duration(seconds: 5)) {
          unawaited(_verifyMediaFlow(room));
        }
      case ConnectionState.reconnecting:
      case ConnectionState.connecting:
        // LiveKit is resuming on its own; RoomReconnectedEvent refreshes
        // the presentation afterwards.
        break;
      case ConnectionState.disconnected:
        _scheduleRejoin(immediate: true);
    }
  }

  Future<bool> _resumeCamera() async {
    if (!_cameraPausedForBackground) return false;
    _cameraPausedForBackground = false;
    final participant = _room?.localParticipant;
    if (!_isCamOn || participant == null) return false;
    try {
      await participant.setCameraEnabled(
        true,
        cameraCaptureOptions: _cameraCapture.copyWith(
          cameraPosition: _cameraPosition,
        ),
      );
    } catch (e) {
      debugPrint('[LiveKit] Could not resume the camera: $e');
      _isCamOn = false;
    }
    await _updateAndroidCallService();
    _safeNotify();
    return true;
  }

  /// Restarts the local camera when it stopped producing frames, which
  /// happens when another app took the camera while this one was hidden.
  Future<void> _healLocalCamera() async {
    if (!_isCamOn) return;
    final track = _room?.localParticipant?.videoTrackPublications
        .where((pub) => pub.source == TrackSource.camera)
        .firstOrNull
        ?.track;
    if (track == null || track.muted) return;
    final before = await _framesSent(track);
    if (before == null) return;
    await Future<void>.delayed(const Duration(milliseconds: 1500));
    if (_isDisposed || _left) return;
    final after = await _framesSent(track);
    if (after == null || after > before) return;
    try {
      await track.restartTrack();
      debugPrint('[LiveKit] Restarted a frozen camera');
    } catch (e) {
      debugPrint('[LiveKit] Camera restart failed: $e');
    }
  }

  Future<num?> _framesSent(LocalVideoTrack track) async {
    try {
      final stats = await track.getSenderStats();
      if (stats.isEmpty) return null;
      return stats.fold<num>(0, (sum, s) => sum + (s.framesSent ?? 0));
    } catch (_) {
      return null;
    }
  }

  /// After a long absence, checks that media still arrives. Android can leave
  /// a peer connection that reports "connected" but no longer receives; that
  /// one is replaced by a fresh join.
  Future<void> _verifyMediaFlow(Room room) async {
    final before = await _inboundBytes(room);
    if (before == null) return;
    await Future<void>.delayed(const Duration(seconds: 4));
    if (_isDisposed || _left || _room != room) return;
    if (room.connectionState != ConnectionState.connected) return;
    final after = await _inboundBytes(room);
    if (after == null || after > before) return;
    debugPrint('[LiveKit] No media received after resume; rejoining');
    _scheduleRejoin(immediate: true);
  }

  /// Bytes received on the tracks that must be flowing right now, or null
  /// when none should be (everyone muted, cameras off).
  Future<num?> _inboundBytes(Room room) async {
    num total = 0;
    var eligible = 0;
    for (final participant in room.remoteParticipants.values) {
      for (final pub in participant.trackPublications.values) {
        final track = pub.track;
        if (!pub.subscribed || pub.muted || track == null) continue;
        try {
          if (track is RemoteVideoTrack) {
            // Screen shares may legitimately be silent; hidden tiles are
            // paused by adaptive streaming.
            if (pub.source == TrackSource.screenShareVideo || !pub.enabled) {
              continue;
            }
            final stats = await track.getReceiverStats();
            if (stats?.bytesReceived == null) continue;
            total += stats!.bytesReceived!;
            eligible++;
          } else if (track is RemoteAudioTrack) {
            final stats = await track.getReceiverStats();
            if (stats?.bytesReceived == null) continue;
            total += stats!.bytesReceived!;
            eligible++;
          }
        } catch (_) {}
      }
    }
    return eligible == 0 ? null : total;
  }

  // ── Presentation watchdog ──
  //
  // A presentation is often a static slide: the presenter's encoder sends a
  // frame only when something changes. Whenever the viewer needs a picture
  // (first subscription, return from the background, transport restart)
  // this makes sure one arrives, escalating from a key-frame request to a new
  // subscription.

  Timer? _presentationTimer;
  String? _watchedPresentationSid;
  int _presentationRecoveries = 0;

  void _watchPresentation({bool kick = false}) {
    _presentationTimer?.cancel();
    _presentationTimer = null;
    if (_isDisposed || _left) return;
    final pub = _presentation;
    if (pub == null) {
      _watchedPresentationSid = null;
      return;
    }
    if (pub.sid != _watchedPresentationSid) {
      _watchedPresentationSid = pub.sid;
      _presentationRecoveries = 0;
    }
    unawaited(_supervisePresentation(pub, kick: kick));
  }

  Future<void> _supervisePresentation(
    RemoteTrackPublication pub, {
    required bool kick,
  }) async {
    try {
      if (!pub.subscribed) {
        // Normally automatic; after a reconnect it can be missed.
        if (pub.subscriptionAllowed) await pub.subscribe();
        _presentationTimer = Timer(
          const Duration(seconds: 4),
          _watchPresentation,
        );
        return;
      }
      // Always receive the presentation, in full quality, even when its view
      // is small or briefly off screen (picture-in-picture, layout changes).
      await pub.enable();
      await pub.setVideoQuality(VideoQuality.HIGH);
      final before = await _framesDecoded(pub);
      if (kick) await _requestKeyFrame(pub);
      if (_isDisposed || _presentation != pub) return;
      _presentationTimer = Timer(
        const Duration(seconds: 4),
        () => unawaited(_checkPresentation(pub, before)),
      );
    } catch (e) {
      debugPrint('[LiveKit] Presentation supervision failed: $e');
    }
  }

  Future<void> _checkPresentation(
    RemoteTrackPublication pub,
    num? before,
  ) async {
    if (_isDisposed || _left || _presentation != pub) return;
    final now = await _framesDecoded(pub);
    if (now == null || now > (before ?? 0)) return;
    if (_presentationRecoveries >= 3) return;
    _presentationRecoveries++;
    debugPrint(
      '[LiveKit] Presentation shows no picture; recovery $_presentationRecoveries',
    );
    if (_presentationRecoveries == 1) {
      _watchPresentation(kick: true);
      return;
    }
    // A new subscription makes the server send a complete picture.
    try {
      await pub.unsubscribe();
      await Future<void>.delayed(const Duration(milliseconds: 600));
      if (_isDisposed || _left) return;
      await pub.subscribe();
    } catch (e) {
      debugPrint('[LiveKit] Presentation resubscribe failed: $e');
    }
    _presentationTimer?.cancel();
    _presentationTimer = Timer(const Duration(seconds: 4), _watchPresentation);
  }

  /// Pausing and resuming delivery makes the server wait for, and request, a
  /// key frame from the presenter before forwarding again.
  Future<void> _requestKeyFrame(RemoteTrackPublication pub) async {
    await pub.disable();
    await Future<void>.delayed(const Duration(milliseconds: 350));
    if (_isDisposed) return;
    await pub.enable();
  }

  Future<num?> _framesDecoded(RemoteTrackPublication pub) async {
    final track = pub.track;
    if (track is! RemoteVideoTrack) return null;
    try {
      return (await track.getReceiverStats())?.framesDecoded;
    } catch (_) {
      return null;
    }
  }

  void _updateConnectionQuality() {
    final lp = _room?.localParticipant;
    if (lp != null) {
      _connectionQuality = lp.connectionQuality;
    }
  }

  MeetingConnectionError _classifyError(Object e) {
    final raw = e.toString().toLowerCase();
    if (raw.contains('timeout') || raw.contains('timed out')) {
      return MeetingConnectionError.timeout;
    }
    if (raw.contains('permission') || raw.contains('denied')) {
      return MeetingConnectionError.permission;
    }
    if (raw.contains('network') ||
        raw.contains('socket') ||
        raw.contains('connection')) {
      return MeetingConnectionError.network;
    }
    return MeetingConnectionError.generic;
  }

  // ── Screen sharing ──

  bool _isScreenSharing = false;
  bool _isScreenShareBusy = false;
  bool get isScreenSharing => _isScreenSharing;
  bool get isScreenShareBusy => _isScreenShareBusy;

  void _onRoomUpdate() {
    if (_isDisposed) return;
    _updateConnectionQuality();
    final pubs = _room?.localParticipant?.trackPublications.values;
    final localShare = pubs
        ?.where((pub) => pub.source == TrackSource.screenShareVideo)
        .firstOrNull;
    final sharing = localShare != null && !localShare.muted;
    if (!_isScreenShareBusy) {
      if (_isScreenSharing && !sharing) {
        // Stopped from outside this screen: the teacher stopped all shares
        // (the server mutes the track) or the capture ended.
        unawaited(_endScreenShare(unpublish: localShare != null));
      }
      _isScreenSharing = sharing;
    }
    _safeNotify();
  }

  Future<void> _endScreenShare({required bool unpublish}) async {
    if (unpublish) {
      try {
        await _room?.localParticipant?.setScreenShareEnabled(false);
      } catch (_) {}
    }
    await _setProjection(false);
  }

  Future<ScreenShareToggleResult> toggleScreenShare() async {
    final participant = _room?.localParticipant;
    if (participant == null || _isScreenShareBusy) {
      return ScreenShareToggleResult.failed;
    }

    _isScreenShareBusy = true;
    _safeNotify();

    final shouldStart = !_isScreenSharing;
    try {
      if (!shouldStart) {
        await participant.setScreenShareEnabled(false);
        _isScreenSharing = false;
        await _setProjection(false);
        return ScreenShareToggleResult.stopped;
      }

      if (_isAndroid) {
        // Make sure the class service runs while this screen is still in
        // front. On phones the system app picker covers the app next, and
        // Android refuses to start a foreground service from the background.
        if (!await _ensureCallService()) return ScreenShareToggleResult.failed;

        // Offers both "entire screen" and "a single app" (Android 14+).
        final granted = await Helper.requestCapturePermission(
          fullScreenOnly: false,
        );
        if (!granted) return ScreenShareToggleResult.cancelled;

        // Android requires a media-projection foreground service before the
        // capture starts. Added synchronously to the running service, so it
        // is in place before LiveKit asks for the projection.
        if (!await _setProjection(true)) return ScreenShareToggleResult.failed;
      }

      await participant.setScreenShareEnabled(true);
      _isScreenSharing = true;
      return ScreenShareToggleResult.started;
    } catch (e) {
      debugPrint('[LiveKit] Screen share error: $e');
      if (shouldStart) {
        try {
          await participant.setScreenShareEnabled(false);
        } catch (_) {}
        await _setProjection(false);
        _isScreenSharing = false;
      }
      return ScreenShareToggleResult.failed;
    } finally {
      _isScreenShareBusy = false;
      _onRoomUpdate();
    }
  }

  // ── Android foreground service ──

  Future<void> _onServiceCall(MethodCall call) async {
    if (call.method != 'leaveRequested' || _isDisposed) return;
    final handler = onLeaveRequested;
    if (handler != null) {
      handler();
    } else {
      await leaveRoom();
    }
  }

  Future<bool> _updateAndroidCallService() async {
    if (!_isAndroid || !_isConnected || _left) return false;
    try {
      return await _meetingService.invokeMethod<bool>('start', {
            'microphone': _isMicOn,
            'camera': _isCamOn && !_cameraPausedForBackground,
            'labels': ?_serviceLabels,
          }) ??
          false;
    } catch (e) {
      debugPrint('[LiveKit] Ongoing meeting service unavailable: $e');
      return false;
    }
  }

  Future<bool> _ensureCallService() async {
    await _updateAndroidCallService();
    for (var attempt = 0; attempt < 30; attempt++) {
      try {
        final running = await _meetingService.invokeMethod<bool>('isRunning');
        if (running == true) return true;
      } catch (_) {
        return false;
      }
      await Future<void>.delayed(const Duration(milliseconds: 100));
    }
    return false;
  }

  Future<bool> _setProjection(bool active) async {
    if (!_isAndroid) return true;
    try {
      return await _meetingService.invokeMethod<bool>('setProjection', {
            'active': active,
          }) ??
          false;
    } catch (e) {
      debugPrint('[LiveKit] Media projection service error: $e');
      return false;
    }
  }

  Future<void> _stopAndroidCallService() async {
    if (!_isAndroid) return;
    try {
      await _meetingService.invokeMethod<void>('stop');
    } catch (e) {
      debugPrint('[LiveKit] Could not stop ongoing meeting service: $e');
    }
  }

  // ── Local media ──

  Future<void> toggleMicrophone() async {
    final participant = _room?.localParticipant;
    if (participant == null) return;
    final enable = !_isMicOn;
    _isMicOn = enable;
    _safeNotify();
    try {
      await participant.setMicrophoneEnabled(enable);
    } catch (e) {
      debugPrint('[LiveKit] Microphone toggle failed: $e');
      _isMicOn = !enable;
    }
    await _updateAndroidCallService();
    _safeNotify();
  }

  Future<void> toggleCamera() async {
    final participant = _room?.localParticipant;
    if (participant == null) return;
    final enable = !_isCamOn;
    _isCamOn = enable;
    _cameraPausedForBackground = false;
    _safeNotify();
    try {
      await participant.setCameraEnabled(
        enable,
        cameraCaptureOptions: _cameraCapture.copyWith(
          cameraPosition: _cameraPosition,
        ),
      );
    } catch (e) {
      debugPrint('[LiveKit] Camera toggle failed: $e');
      _isCamOn = !enable;
    }
    await _updateAndroidCallService();
    _safeNotify();
  }

  CameraPosition _cameraPosition = CameraPosition.front;
  CameraPosition get cameraPosition => _cameraPosition;

  Future<void> flipCamera() async {
    final track = _room?.localParticipant?.videoTrackPublications
        .where((pub) => pub.source == TrackSource.camera)
        .firstOrNull
        ?.track;
    if (track == null) return;
    try {
      final newPosition = _cameraPosition.switched();
      await track.setCameraPosition(newPosition);
      _cameraPosition = newPosition;
      _safeNotify();
    } catch (_) {}
  }

  void toggleHandRaise() {
    _isHandRaised = !_isHandRaised;
    _safeNotify();
  }

  void setHandRaised(bool raised) {
    _isHandRaised = raised;
    _safeNotify();
  }

  Future<void> leaveRoom() async {
    _left = true;
    await _shutdown();
  }

  Future<void> _shutdown() async {
    _rejoinTimer?.cancel();
    _rejoinTimer = null;
    _presentationTimer?.cancel();
    _presentationTimer = null;
    if (_isScreenSharing) {
      _isScreenSharing = false;
      await _setProjection(false);
    }
    await _releaseRoom(disconnect: true);
    await _stopAndroidCallService();
    _isConnected = false;
    _isReconnecting = false;
    _safeNotify();
  }

  Future<void> _releaseRoom({required bool disconnect}) async {
    final oldRoom = _room;
    final oldEvents = _roomEvents;
    _room = null;
    _roomEvents = null;
    if (oldRoom == null) return;
    _intentionalDisconnect = true;
    oldRoom.removeListener(_onRoomUpdate);
    try {
      await oldEvents?.dispose();
      if (disconnect) await oldRoom.disconnect();
    } catch (e) {
      debugPrint('[LiveKit] Room cleanup error: $e');
    } finally {
      try {
        await oldRoom.dispose();
      } catch (e) {
        debugPrint('[LiveKit] Room disposal error: $e');
      }
      _intentionalDisconnect = false;
    }
  }

  void _safeNotify() {
    if (!_isDisposed) notifyListeners();
  }

  @override
  void dispose() {
    if (_isDisposed) return;
    _left = true;
    _rejoinTimer?.cancel();
    _presentationTimer?.cancel();
    if (_isAndroid && identical(_serviceOwner, this)) {
      _serviceOwner = null;
      _meetingService.setMethodCallHandler(null);
    }
    unawaited(_shutdown());
    _isDisposed = true;
    super.dispose();
  }
}
