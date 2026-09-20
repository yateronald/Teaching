import 'package:flutter/foundation.dart';
import 'package:livekit_client/livekit_client.dart';

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
      _room = Room();

      final roomOptions = const RoomOptions(
        adaptiveStream: true,
        dynacast: true,
        defaultVideoPublishOptions: VideoPublishOptions(
          simulcast: true,
        ),
      );

      _room = Room(roomOptions: roomOptions);

      // Listen to room events
      _room!.addListener(_onRoomUpdate);

      await _room!.connect(url, token);

      _isMicOn = startWithMic;
      _isCamOn = startWithCam;

      if (_isMicOn) {
        await _room!.localParticipant?.setMicrophoneEnabled(true);
      }
      if (_isCamOn) {
        await _room!.localParticipant?.setCameraEnabled(true);
      }

      _isConnected = true;
      _isConnecting = false;
      notifyListeners();
    } catch (e) {
      _isConnected = false;
      _isConnecting = false;
      _errorMessage = 'Échec de connexion à la salle de visioconférence : $e';
      notifyListeners();
    }
  }

  void _onRoomUpdate() {
    notifyListeners();
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
    final track = _room?.localParticipant?.videoTrackPublications.firstOrNull?.track;
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

  Future<void> leaveRoom() async {
    try {
      await _room?.disconnect();
      await _room?.dispose();
    } catch (_) {}
    _room = null;
    _isConnected = false;
    notifyListeners();
  }

  @override
  void dispose() {
    _room?.removeListener(_onRoomUpdate);
    _room?.disconnect();
    _room?.dispose();
    super.dispose();
  }
}
