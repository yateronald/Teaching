import 'package:flutter/foundation.dart';
import 'package:socket_io_client/socket_io_client.dart' as io;
import '../api/api_endpoints.dart';
import '../auth/token_storage.dart';

/// Real-time socket service matching the web's Socket.io client.
class SocketService {
  io.Socket? _socket;
  final TokenStorage _tokenStorage;
  bool _connecting = false;

  SocketService({TokenStorage? tokenStorage})
      : _tokenStorage = tokenStorage ?? TokenStorage();

  io.Socket? get socket => _socket;
  bool get isConnected => _socket?.connected ?? false;

  Future<io.Socket> connect() async {
    if (_socket != null && _socket!.connected) return _socket!;
    if (_connecting) {
      await Future.delayed(const Duration(milliseconds: 300));
      if (_socket != null && _socket!.connected) return _socket!;
    }

    _connecting = true;
    final token = await _tokenStorage.getToken();
    final url = kIsWeb ? ApiEndpoints.webSocketUrl : ApiEndpoints.socketUrl;

    final newSocket = io.io(
      url,
      io.OptionBuilder()
          .setTransports(['websocket', 'polling'])
          .enableAutoConnect()
          .enableReconnection()
          .setAuth({'token': token})
          .setExtraHeaders({'Authorization': 'Bearer $token'})
          .build(),
    );

    newSocket.onConnect((_) {
      debugPrint('[Socket] Connected to $url');
      _connecting = false;
    });

    newSocket.onDisconnect((reason) {
      debugPrint('[Socket] Disconnected: $reason');
      _connecting = false;
    });

    newSocket.onError((err) {
      debugPrint('[Socket] Error: $err');
      _connecting = false;
    });

    _socket = newSocket;
    return newSocket;
  }

  void emit(String event, dynamic data) {
    _socket?.emit(event, data);
  }

  void on(String event, Function(dynamic) handler) {
    _socket?.on(event, handler);
  }

  void off(String event) {
    _socket?.off(event);
  }

  void disconnect() {
    _socket?.disconnect();
    _socket?.dispose();
    _socket = null;
    _connecting = false;
  }
}
