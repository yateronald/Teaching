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

  Future<String?> getToken() async {
    return await _storage.read(key: _tokenKey);
  }

  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }

  Future<void> saveUserJson(String userJson) async {
    await _storage.write(key: _userJsonKey, value: userJson);
  }

  Future<String?> getUserJson() async {
    return await _storage.read(key: _userJsonKey);
  }

  Future<void> clearAll() async {
    await _storage.deleteAll();
  }
}
