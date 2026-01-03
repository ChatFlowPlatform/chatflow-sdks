/// Base exception for AI Chat SDK
class AIChatException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  AIChatException(this.message, {this.statusCode, this.details});

  @override
  String toString() {
    if (statusCode != null) {
      return 'AIChatException($statusCode): $message';
    }
    return 'AIChatException: $message';
  }
}

/// Authentication error
class AuthenticationException extends AIChatException {
  AuthenticationException(String message, {int? statusCode, dynamic details})
      : super(message, statusCode: statusCode, details: details);
}

/// Network error
class NetworkException extends AIChatException {
  NetworkException(String message, {int? statusCode, dynamic details})
      : super(message, statusCode: statusCode, details: details);
}

/// Validation error
class ValidationException extends AIChatException {
  ValidationException(String message, {int? statusCode, dynamic details})
      : super(message, statusCode: statusCode, details: details);
}

/// Resource not found error
class NotFoundException extends AIChatException {
  NotFoundException(String message, {int? statusCode, dynamic details})
      : super(message, statusCode: statusCode ?? 404, details: details);
}

/// WebSocket error
class WebSocketException extends AIChatException {
  WebSocketException(String message, {dynamic details})
      : super(message, details: details);
}
