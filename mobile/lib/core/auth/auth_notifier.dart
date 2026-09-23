import 'dart:async';
import 'dart:convert';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import 'token_storage.dart';
import '../../features/auth/models/user_model.dart';

class AuthState {
  final bool isLoading;
  final bool isAuthenticated;
  final UserModel? user;
  final String? errorMessage;

  /// Signed in from the session saved on the phone (app opened), rather than
  /// by typing the password just now. Only then does the fingerprint lock apply.
  final bool restored;

  const AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.errorMessage,
    this.restored = false,
  });

  AuthState copyWith({
    bool? isLoading,
    bool? isAuthenticated,
    UserModel? user,
    String? errorMessage,
  }) {
    return AuthState(
      isLoading: isLoading ?? this.isLoading,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      user: user ?? this.user,
      errorMessage: errorMessage,
      restored: restored,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient _apiClient;
  final TokenStorage _tokenStorage;

  AuthNotifier({
    required ApiClient apiClient,
    required TokenStorage tokenStorage,
  })  : _apiClient = apiClient,
        _tokenStorage = tokenStorage,
        super(const AuthState(isLoading: true)) {
    _apiClient.onSessionEnded = _onSessionEnded;
    checkAuth();
  }

  /// Renew the six-month mobile session once it is a week old, so a teacher
  /// who uses the app at least every six months never has to sign in again.
  static const _renewAfter = Duration(days: 7);
  bool _renewedThisLaunch = false;

  Future<void> checkAuth() async {
    final token = await _tokenStorage.getToken();
    if (token == null || token.isEmpty || _isExpired(token)) {
      if (token != null) await _tokenStorage.clearSession();
      state = const AuthState(isLoading: false, isAuthenticated: false);
      return;
    }

    UserModel? cachedUser;
    final cachedUserJson = await _tokenStorage.getUserJson();
    if (cachedUserJson != null) {
      try {
        cachedUser = UserModel.fromJson(jsonDecode(cachedUserJson));
      } catch (_) {}
    }

    // Open straight away with the saved account: no spinner, and it also
    // works with no connection. The server check below refreshes it.
    if (cachedUser != null) {
      state = AuthState(
        isLoading: false,
        isAuthenticated: true,
        user: cachedUser,
        restored: true,
      );
    }

    for (var attempt = 0; attempt < 3; attempt++) {
      try {
        final response = await _apiClient.get(ApiEndpoints.me);
        final userData = response.data?['user'] ?? response.data;
        if (userData is! Map) break;
        final user = UserModel.fromJson(Map<String, dynamic>.from(userData));
        await _tokenStorage.saveUserJson(jsonEncode(user.toJson()));
        state = AuthState(
          isLoading: false,
          isAuthenticated: true,
          user: user,
          restored: true,
        );
        unawaited(_renewIfDue());
        return;
      } on ApiException catch (e) {
        // 401/403: the session really is over.
        if (e.statusCode == 401 || e.statusCode == 403) {
          await _tokenStorage.clearSession();
          if (mounted && !state.isAuthenticated) {
            state = const AuthState(isLoading: false, isAuthenticated: false);
          }
          return;
        }
      } catch (_) {
        // Offline or server trouble: keep the session, try again shortly.
      }
      if (!mounted || !state.isAuthenticated && cachedUser != null) return;
      await Future<void>.delayed(Duration(seconds: 2 * (attempt + 1)));
    }

    if (!mounted) return;
    if (cachedUser == null) {
      // Nothing to show without the server. Keep the token: the next launch
      // with a connection gets straight back in.
      state = const AuthState(isLoading: false, isAuthenticated: false);
    }
  }

  bool _isExpired(String token) {
    final exp = TokenStorage.claimsOf(token)?['exp'];
    if (exp is! num) return false;
    final expiry = DateTime.fromMillisecondsSinceEpoch(exp.toInt() * 1000);
    return expiry.isBefore(DateTime.now());
  }

  /// Extends the mobile session to six months from now, at most once a launch.
  Future<void> _renewIfDue() async {
    if (_renewedThisLaunch) return;
    final token = await _tokenStorage.getToken();
    final claims = TokenStorage.claimsOf(token);
    if (claims == null) return;
    final issued = claims['iat'];
    final isMobileToken = claims['app'] == 'mobile';
    final age = issued is num
        ? DateTime.now().difference(
            DateTime.fromMillisecondsSinceEpoch(issued.toInt() * 1000),
          )
        : _renewAfter;
    // A week-long token from before six-month sessions is upgraded at once.
    if (isMobileToken && age < _renewAfter) return;
    _renewedThisLaunch = true;
    try {
      final res = await _apiClient.post(ApiEndpoints.refreshToken);
      final fresh = res.data?['token'];
      if (fresh is String && fresh.isNotEmpty && state.isAuthenticated) {
        await _tokenStorage.saveTokens(token: fresh);
      }
    } catch (e) {
      debugPrint('Session renewal skipped: $e');
    }
  }

  /// The server refused this device's token: signed out elsewhere, password
  /// changed, account disabled or the six months are over.
  void _onSessionEnded() {
    if (!state.isAuthenticated) return;
    unawaited(_tokenStorage.clearSession());
    state = const AuthState(
      isLoading: false,
      isAuthenticated: false,
      errorMessage: 'Votre session a pris fin. Veuillez vous reconnecter.',
    );
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);

    try {
      final response = await _apiClient.post(
        ApiEndpoints.login,
        data: {'email': email.trim(), 'password': password},
      );

      final data = response.data;
      final token = data['token'] as String?;
      final refreshToken = data['refreshToken'] as String?;
      final userData = data['user'];

      if (token == null || userData == null) {
        throw ApiException(message: 'Invalid response from server.');
      }

      final user = UserModel.fromJson(userData);

      // Enforce teacher or admin role for this app
      if (!user.isTeacher && !user.isAdmin) {
        throw ApiException(
          message: 'Access restricted: This mobile app is dedicated to Teachers. Please use the web portal.',
        );
      }

      await _tokenStorage.saveTokens(token: token, refreshToken: refreshToken);
      await _tokenStorage.saveUserJson(jsonEncode(user.toJson()));
      _renewedThisLaunch = true;

      state = AuthState(
        isLoading: false,
        isAuthenticated: true,
        user: user,
      );
      return true;
    } on ApiException catch (e) {
      debugPrint('LOGIN ApiException: ${e.message}, status: ${e.statusCode}');
      state = state.copyWith(isLoading: false, errorMessage: e.message);
      return false;
    } on DioException catch (e) {
      debugPrint('LOGIN DioException: ${e.message}, error: ${e.error}');
      final msg = (e.error is ApiException)
          ? (e.error as ApiException).message
          : (e.error != null ? e.error.toString() : (e.message ?? 'Network error occurred. Please try again.'));
      state = state.copyWith(isLoading: false, errorMessage: msg);
      return false;
    } catch (e, st) {
      debugPrint('LOGIN Generic Exception: $e\n$st');
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'An unexpected error occurred: $e',
      );
      return false;
    }
  }

  Future<void> logout() async {
    try {
      await _apiClient.post(ApiEndpoints.logout);
    } catch (_) {}
    await _tokenStorage.clearSession();
    state = const AuthState(isLoading: false, isAuthenticated: false);
  }

  void updateUser(UserModel updatedUser) {
    state = state.copyWith(user: updatedUser);
    _tokenStorage.saveUserJson(jsonEncode(updatedUser.toJson()));
  }

  Future<UserModel?> fetchProfile() async {
    try {
      final res = await _apiClient.get('/auth/profile');
      if (res.data != null && res.data['user'] != null) {
        final u = UserModel.fromJson(res.data['user']);
        updateUser(u);
        return u;
      }
    } catch (e) {
      debugPrint('Error fetching profile: $e');
    }
    return null;
  }

  Future<Map<String, dynamic>> updateProfile({
    String? firstName,
    String? lastName,
    String? username,
    String? timezone,
    String? email,
  }) async {
    try {
      final data = <String, dynamic>{};
      if (firstName != null) data['first_name'] = firstName.trim();
      if (lastName != null) data['last_name'] = lastName.trim();
      if (username != null) data['username'] = username.trim();
      if (timezone != null) data['timezone'] = timezone;
      if (email != null && email.isNotEmpty) data['email'] = email.trim();

      final res = await _apiClient.put('/auth/profile', data: data);
      if (res.data != null && res.data['user'] != null) {
        final u = UserModel.fromJson(res.data['user']);
        updateUser(u);
        return {'success': true, 'user': u, 'message': res.data['message']};
      }
      return {'success': true};
    } on ApiException catch (e) {
      return {'success': false, 'error': e.message};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> changePassword({
    required String currentPassword,
    required String newPassword,
  }) async {
    try {
      final res = await _apiClient.put(
        '/auth/change-password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );
      final msg = res.data?['message'] ?? 'Password changed successfully';
      return {'success': true, 'message': msg};
    } on ApiException catch (e) {
      return {'success': false, 'error': e.message};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> uploadProfilePhoto({
    List<int>? bytes,
    String? filePath,
    required String filename,
  }) async {
    try {
      MultipartFile file;
      if (bytes != null) {
        file = MultipartFile.fromBytes(bytes, filename: filename);
      } else if (filePath != null) {
        file = await MultipartFile.fromFile(filePath, filename: filename);
      } else {
        return {'success': false, 'error': 'No file provided'};
      }

      final formData = FormData.fromMap({'photo': file});
      await _apiClient.post('/auth/profile-photo', data: formData);
      await fetchProfile();
      return {'success': true};
    } on ApiException catch (e) {
      return {'success': false, 'error': e.message};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }

  Future<Map<String, dynamic>> removeProfilePhoto() async {
    try {
      await _apiClient.delete('/auth/profile-photo');
      await fetchProfile();
      return {'success': true};
    } on ApiException catch (e) {
      return {'success': false, 'error': e.message};
    } catch (e) {
      return {'success': false, 'error': e.toString()};
    }
  }
}

// Global Providers
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    apiClient: ref.watch(apiClientProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});
final authNotifierProvider = authProvider;
