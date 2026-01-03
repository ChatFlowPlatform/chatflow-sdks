import 'package:equatable/equatable.dart';

/// Configuration for AIChatClient
class AIChatConfig extends Equatable {
  /// Base API URL
  final String apiUrl;

  /// WebSocket URL
  final String? wsUrl;

  /// API Key (optional, can use JWT instead)
  final String? apiKey;

  /// Request timeout duration
  final Duration timeout;

  /// Enable debug logging
  final bool debug;

  const AIChatConfig({
    required this.apiUrl,
    this.wsUrl,
    this.apiKey,
    this.timeout = const Duration(seconds: 30),
    this.debug = false,
  });

  /// Get WebSocket URL (derive from apiUrl if not provided)
  String get websocketUrl {
    if (wsUrl != null) return wsUrl!;
    if (apiUrl.startsWith('https://')) {
      return apiUrl.replaceFirst('https://', 'wss://');
    }
    return apiUrl.replaceFirst('http://', 'ws://');
  }

  AIChatConfig copyWith({
    String? apiUrl,
    String? wsUrl,
    String? apiKey,
    Duration? timeout,
    bool? debug,
  }) {
    return AIChatConfig(
      apiUrl: apiUrl ?? this.apiUrl,
      wsUrl: wsUrl ?? this.wsUrl,
      apiKey: apiKey ?? this.apiKey,
      timeout: timeout ?? this.timeout,
      debug: debug ?? this.debug,
    );
  }

  @override
  List<Object?> get props => [apiUrl, wsUrl, apiKey, timeout, debug];
}
