import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure local storage for authentication tokens and credentials.
class TokenStorage {
  static const _tokenKey = 'auth_token';
  static const _refreshTokenKey = 'auth_refresh_token';
  static const _userJsonKey = 'auth_user_json';

  final FlutterSecureStorage _storage;

  TokenStorage({FlutterSecureStorage? storage})
      : _storage = storage ??
            const FlutterSecureStorage(
              aOptions: AndroidOptions(encryptedSharedPreferences: true),
            );

  Future<void> saveTokens({required String token, String? refreshToken}) async {
    await _storage.write(key: _tokenKey, value: token);
    if (refreshToken != null) {
      await _storage.write(key: _refreshTokenKey, value: refreshToken);
    }
  }

  Future<String?> getToken() => _read(_tokenKey);

  Future<String?> getRefreshToken() => _read(_refreshTokenKey);

  Future<void> saveUserJson(String userJson) async {
    await _storage.write(key: _userJsonKey, value: userJson);
  }

  Future<String?> getUserJson() => _read(_userJsonKey);

  /// A read that fails (Android can refuse to decrypt after a restore) means
  /// "nothing stored", not a crash of the start-up sequence.
  Future<String?> _read(String key) async {
    try {
      return await _storage.read(key: key);
    } catch (e) {
      debugPrint('[TokenStorage] Could not read $key: $e');
      return null;
    }
  }

  /// Signs this device out. Device settings (fingerprint unlock) stay.
  Future<void> clearSession() async {
    for (final key in [_tokenKey, _refreshTokenKey, _userJsonKey]) {
      try {
        await _storage.delete(key: key);
      } catch (_) {}
    }
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }

  /// The claims of a JWT, without verifying it (the server does that).
  static Map<String, dynamic>? claimsOf(String? token) {
    if (token == null) return null;
    final parts = token.split('.');
    if (parts.length != 3) return null;
    try {
      final payload = utf8.decode(base64Url.decode(base64Url.normalize(parts[1])));
      final claims = jsonDecode(payload);
      return claims is Map<String, dynamic> ? claims : null;
    } catch (_) {
      return null;
    }
  }
}
