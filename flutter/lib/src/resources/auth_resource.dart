import 'dart:convert';
import 'package:http/http.dart' as http;
import '../config/aichat_config.dart';
import '../exceptions/exceptions.dart';
import '../models/models.dart';

class AuthResource {
  final AIChatConfig config;
  final http.Client client;
  String? _accessToken;
  String? _refreshToken;

  AuthResource({
    required this.config,
    required this.client,
  });

  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;

  Map<String, String> get _headers {
    final headers = {
      'Content-Type': 'application/json',
    };

    if (config.apiKey != null) {
      headers['X-API-Key'] = config.apiKey!;
    } else if (_accessToken != null) {
      headers['Authorization'] = 'Bearer $_accessToken';
    }

    return headers;
  }

  /// Register a new user
  Future<AuthResponse> register(RegisterRequest request) async {
    try {
      final response = await client
          .post(
            Uri.parse('${config.apiUrl}/api/auth/register'),
            headers: _headers,
            body: jsonEncode(request.toJson()),
          )
          .timeout(config.timeout);

      if (response.statusCode == 200 || response.statusCode == 201) {
        final data = jsonDecode(response.body);
        final authResponse = AuthResponse.fromJson(data);
        _accessToken = authResponse.accessToken;
        _refreshToken = authResponse.refreshToken;
        return authResponse;
      } else {
        final error = jsonDecode(response.body);
        throw ValidationException(
          error['message'] ?? 'Registration failed',
          statusCode: response.statusCode,
          details: error,
        );
      }
    } catch (e) {
      if (e is AIChatException) rethrow;
      throw NetworkException('Network error: $e');
    }
  }

  /// Login with email and password
  Future<AuthResponse> login(LoginRequest request) async {
    try {
      final response = await client
          .post(
            Uri.parse('${config.apiUrl}/api/auth/login'),
            headers: _headers,
            body: jsonEncode(request.toJson()),
          )
          .timeout(config.timeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final authResponse = AuthResponse.fromJson(data);
        _accessToken = authResponse.accessToken;
        _refreshToken = authResponse.refreshToken;
        return authResponse;
      } else {
        final error = jsonDecode(response.body);
        throw AuthenticationException(
          error['message'] ?? 'Login failed',
          statusCode: response.statusCode,
          details: error,
        );
      }
    } catch (e) {
      if (e is AIChatException) rethrow;
      throw NetworkException('Network error: $e');
    }
  }

  /// Refresh access token
  Future<AuthResponse> refresh() async {
    if (_refreshToken == null) {
      throw AuthenticationException('No refresh token available');
    }

    try {
      final response = await client
          .post(
            Uri.parse('${config.apiUrl}/api/auth/refresh'),
            headers: _headers,
            body: jsonEncode({'refreshToken': _refreshToken}),
          )
          .timeout(config.timeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final authResponse = AuthResponse.fromJson(data);
        _accessToken = authResponse.accessToken;
        _refreshToken = authResponse.refreshToken;
        return authResponse;
      } else {
        final error = jsonDecode(response.body);
        throw AuthenticationException(
          error['message'] ?? 'Token refresh failed',
          statusCode: response.statusCode,
          details: error,
        );
      }
    } catch (e) {
      if (e is AIChatException) rethrow;
      throw NetworkException('Network error: $e');
    }
  }

  /// Get current user
  Future<User> me() async {
    try {
      final response = await client
          .get(
            Uri.parse('${config.apiUrl}/api/auth/me'),
            headers: _headers,
          )
          .timeout(config.timeout);

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        return User.fromJson(data);
      } else {
        final error = jsonDecode(response.body);
        throw AuthenticationException(
          error['message'] ?? 'Failed to get user',
          statusCode: response.statusCode,
          details: error,
        );
      }
    } catch (e) {
      if (e is AIChatException) rethrow;
      throw NetworkException('Network error: $e');
    }
  }

  /// Logout
  Future<void> logout() async {
    try {
      await client
          .post(
            Uri.parse('${config.apiUrl}/api/auth/logout'),
            headers: _headers,
            body: jsonEncode({'refreshToken': _refreshToken}),
          )
          .timeout(config.timeout);
    } finally {
      _accessToken = null;
      _refreshToken = null;
    }
  }

  /// Set tokens manually (e.g., from storage)
  void setTokens({String? accessToken, String? refreshToken}) {
    _accessToken = accessToken;
    _refreshToken = refreshToken;
  }
}
