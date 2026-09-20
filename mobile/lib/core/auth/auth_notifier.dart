import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../api/api_client.dart';
import '../api/api_endpoints.dart';
import '../api/api_error.dart';
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
    } catch (_) {
      // If network error but we have cached user, keep user logged in
      final cachedUserJson = await _tokenStorage.getUserJson();
      if (cachedUserJson != null) {
        try {
          final user = UserModel.fromJson(jsonDecode(cachedUserJson));
          state = AuthState(isLoading: false, isAuthenticated: true, user: user);
          return;
        } catch (_) {}
      }
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
      state = state.copyWith(isLoading: false, errorMessage: e.message);
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'Connection failed. Please check your network and try again.',
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
}

// Global Providers
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    apiClient: ref.watch(apiClientProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});
final authNotifierProvider = authProvider;
