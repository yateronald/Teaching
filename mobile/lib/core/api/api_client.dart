import 'dart:io' show HttpClient, HttpDate;
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_endpoints.dart';
import 'api_error.dart';
import '../auth/token_storage.dart';

export 'api_error.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient(tokenStorage: ref.watch(tokenStorageProvider)));

/// Secure API client configured with Dio and token interceptors.
class ApiClient {
  late final Dio dio;
  final TokenStorage tokenStorage;
  Duration _serverTimeOffset = Duration.zero;

  DateTime get estimatedServerNow => DateTime.now().add(_serverTimeOffset);

  /// Called when the server says this device's session is over (signed out
  /// elsewhere, password changed, account disabled). Set by the auth notifier.
  void Function()? onSessionEnded;

  /// Identifies the mobile app, which gets a six-month session.
  static String get clientAppHeader =>
      'lfwn-mobile/1 (${kIsWeb ? 'web' : defaultTargetPlatform.name.toLowerCase()})';

  ApiClient({TokenStorage? tokenStorage, String? customBaseUrl})
      : tokenStorage = tokenStorage ?? TokenStorage() {
    final baseUrl = customBaseUrl ?? (kIsWeb ? ApiEndpoints.webBaseUrl : ApiEndpoints.baseUrl);

    dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: 25),
        receiveTimeout: const Duration(seconds: 25),
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-Client-App': clientAppHeader,
        },
      ),
    );

    if (!kIsWeb) {
      dio.httpClientAdapter = IOHttpClientAdapter(
        createHttpClient: () {
          final client = HttpClient();
          client.badCertificateCallback = (cert, host, port) {
            // Handle emulator/device clock skew for platform API domain
            if (kDebugMode || host.contains('learnfrenchwithnatives.com')) {
              return true;
            }
            return false;
          };
          return client;
        },
      );
    }

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await this.tokenStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onResponse: (response, handler) {
          final dateStr = response.headers.value('date');
          if (dateStr != null && !kIsWeb) {
            try {
              final serverTime = HttpDate.parse(dateStr);
              _serverTimeOffset = serverTime.difference(DateTime.now());
            } catch (_) {}
          }
          return handler.next(response);
        },
        onError: (DioException error, handler) async {
          // Parse server error response
          final data = error.response?.data;
          String message = 'An unexpected error occurred. Please try again.';

          if (data is Map) {
            message = data['error'] ?? data['message'] ?? message;
          } else if (error.type == DioExceptionType.connectionTimeout ||
              error.type == DioExceptionType.receiveTimeout) {
            message = 'Connection timed out. Please check your internet connection.';
          } else if (error.type == DioExceptionType.connectionError) {
            message = 'Cannot connect to server. Please check your network.';
          } else if (error.error != null) {
            message = error.error.toString();
          }

          // Only a refusal of a token we actually sent ends the session;
          // network errors and server trouble never sign the user out.
          final status = error.response?.statusCode;
          final sentToken =
              error.requestOptions.headers['Authorization'] != null;
          final disabled =
              status == 403 && data is Map && data['code'] == 'ACCOUNT_DISABLED';
          if (sentToken && (status == 401 || disabled)) {
            onSessionEnded?.call();
          }

          final apiException = ApiException(
            message: message,
            statusCode: error.response?.statusCode,
            details: data,
          );

          return handler.reject(
            DioException(
              requestOptions: error.requestOptions,
              error: apiException,
              response: error.response,
              type: error.type,
            ),
          );
        },
      ),
    );
  }

  Future<Response<T>> _handle<T>(Future<Response<T>> Function() call) async {
    try {
      return await call();
    } on DioException catch (e) {
      if (e.error is ApiException) {
        throw e.error as ApiException;
      }
      rethrow;
    }
  }

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters, Options? options}) {
    return _handle(() => dio.get<T>(path, queryParameters: queryParameters, options: options));
  }

  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options, ProgressCallback? onSendProgress}) {
    return _handle(() => dio.post<T>(path, data: data, queryParameters: queryParameters, options: options, onSendProgress: onSendProgress));
  }

  Future<Response<T>> put<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) {
    return _handle(() => dio.put<T>(path, data: data, queryParameters: queryParameters, options: options));
  }

  Future<Response<T>> patch<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) {
    return _handle(() => dio.patch<T>(path, data: data, queryParameters: queryParameters, options: options));
  }

  Future<Response<T>> delete<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, Options? options}) {
    return _handle(() => dio.delete<T>(path, data: data, queryParameters: queryParameters, options: options));
  }
}
