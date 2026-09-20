import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'api_endpoints.dart';
import 'api_error.dart';
import '../auth/token_storage.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());
final apiClientProvider = Provider<ApiClient>((ref) => ApiClient(tokenStorage: ref.watch(tokenStorageProvider)));

/// Secure API client configured with Dio and token interceptors.
class ApiClient {
  late final Dio dio;
  final TokenStorage tokenStorage;

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
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await this.tokenStorage.getToken();
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
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

  Future<Response<T>> get<T>(String path, {Map<String, dynamic>? queryParameters}) {
    return dio.get<T>(path, queryParameters: queryParameters);
  }

  Future<Response<T>> post<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters, ProgressCallback? onSendProgress}) {
    return dio.post<T>(path, data: data, queryParameters: queryParameters, onSendProgress: onSendProgress);
  }

  Future<Response<T>> put<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters}) {
    return dio.put<T>(path, data: data, queryParameters: queryParameters);
  }

  Future<Response<T>> patch<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters}) {
    return dio.patch<T>(path, data: data, queryParameters: queryParameters);
  }

  Future<Response<T>> delete<T>(String path, {dynamic data, Map<String, dynamic>? queryParameters}) {
    return dio.delete<T>(path, data: data, queryParameters: queryParameters);
  }
}
