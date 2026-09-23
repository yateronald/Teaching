import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';

/// Android picture-in-picture for a live class, as in Meet or Teams: leaving
/// the app shrinks the class into a small floating window that keeps showing
/// the presentation or the person speaking, with mute and leave buttons.
class MeetingPip extends ChangeNotifier {
  static const MethodChannel _channel = MethodChannel(
    'learnfrenchwithnatives/pip',
  );

  MeetingPip() {
    if (_isAndroid) {
      _owner = this;
      _channel.setMethodCallHandler(_onCall);
      unawaited(_loadSupport());
    }
  }

  static MeetingPip? _owner;

  bool _supported = false;
  bool _active = false;
  bool _disposed = false;
  Map<String, Object?>? _lastConfig;
  Map<String, String>? _lastLabels;

  /// Mic, camera and leave buttons of the floating window.
  void Function(String action)? onAction;

  bool get isSupported => _supported;

  /// True while the class is shown in the floating window.
  bool get isActive => _active;

  static bool get _isAndroid =>
      !kIsWeb && defaultTargetPlatform == TargetPlatform.android;

  Future<void> _loadSupport() async {
    try {
      _supported = await _channel.invokeMethod<bool>('isSupported') ?? false;
      _active = await _channel.invokeMethod<bool>('isActive') ?? false;
    } catch (_) {
      _supported = false;
    }
    if (!_disposed) notifyListeners();
  }

  Future<dynamic> _onCall(MethodCall call) async {
    if (_disposed) return;
    switch (call.method) {
      case 'pipChanged':
        final active = call.arguments == true;
        if (active == _active) return;
        _active = active;
        notifyListeners();
      case 'pipAction':
        final action = call.arguments;
        if (action is String) onAction?.call(action);
    }
  }

  /// Tells Android whether leaving the app should open the floating window,
  /// its shape, and the state of its buttons. Unchanged settings are not
  /// sent again.
  Future<void> configure({
    required bool enabled,
    required bool landscape,
    required bool micOn,
    required bool camOn,
    required Map<String, String> labels,
  }) async {
    if (!_isAndroid || _disposed) return;
    final config = <String, Object?>{
      'enabled': enabled && _supported,
      // Presentations are wide; a person looks best in a portrait window.
      'aspectWidth': landscape ? 16 : 3,
      'aspectHeight': landscape ? 9 : 4,
      'micOn': micOn,
      'camOn': camOn,
    };
    if (mapEquals(config, _lastConfig) && mapEquals(labels, _lastLabels)) {
      return;
    }
    _lastConfig = config;
    _lastLabels = labels;
    try {
      await _channel.invokeMethod<void>('configure', {
        ...config,
        'labels': labels,
      });
    } catch (_) {
      // No activity right now (it was closed while the class continues).
      _lastConfig = null;
    }
  }

  /// Forces the next [configure] to be sent, e.g. to a newly created activity.
  void invalidate() {
    _lastConfig = null;
    if (_isAndroid && !_supported) unawaited(_loadSupport());
  }

  /// Opens the floating window now (the "minimise" button).
  Future<bool> enter() async {
    if (!_isAndroid || !_supported) return false;
    try {
      return await _channel.invokeMethod<bool>('enter') ?? false;
    } catch (_) {
      return false;
    }
  }

  /// Closes the floating window, e.g. when the class ends inside it.
  Future<void> dismiss() async {
    if (!_isAndroid) return;
    try {
      await _channel.invokeMethod<void>('dismiss');
    } catch (_) {}
  }

  @override
  void dispose() {
    _disposed = true;
    if (_isAndroid && identical(_owner, this)) {
      _owner = null;
      // Leaving the class must stop the app from shrinking on "home".
      unawaited(
        _channel
            .invokeMethod<void>('configure', {'enabled': false})
            .catchError((_) {}),
      );
      _channel.setMethodCallHandler(null);
    }
    super.dispose();
  }
}
