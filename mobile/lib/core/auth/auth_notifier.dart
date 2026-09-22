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

  const AuthState({
    this.isLoading = false,
    this.isAuthenticated = false,
    this.user,
    this.errorMessage,
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
    checkAuth();
  }

  Future<void> checkAuth() async {
    try {
      final token = await _tokenStorage.getToken();
      if (token == null || token.isEmpty) {
        state = const AuthState(isLoading: false, isAuthenticated: false);
        return;
      }

      // Check stored user cache first for instant resume
      final cachedUserJson = await _tokenStorage.getUserJson();
      UserModel? cachedUser;
      if (cachedUserJson != null) {
        try {
          cachedUser = UserModel.fromJson(jsonDecode(cachedUserJson));
        } catch (_) {}
      }

      state = state.copyWith(isLoading: true, user: cachedUser);

      // Verify token with backend
      final response = await _apiClient.get(ApiEndpoints.me);
      if (response.statusCode == 200 && response.data != null) {
        final userData = response.data['user'] ?? response.data;
        final user = UserModel.fromJson(userData);
        await _tokenStorage.saveUserJson(jsonEncode(user.toJson()));
        state = AuthState(
          isLoading: false,
          isAuthenticated: true,
          user: user,
        );
      } else {
        await _tokenStorage.clearAll();
        state = const AuthState(isLoading: false, isAuthenticated: false);
      }
    } catch (e) {
      // Token expired, invalid or unauthorized — clear session and show login
      await _tokenStorage.clearAll();
      state = const AuthState(isLoading: false, isAuthenticated: false);
    }
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
    await _tokenStorage.clearAll();
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
