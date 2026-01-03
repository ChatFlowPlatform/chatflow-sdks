import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'conversation.g.dart';

@JsonSerializable()
class Conversation extends Equatable {
  final String id;
  final String widgetId;
  final String? visitorId;
  final String? assignedTo;
  final ConversationStatus status;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;
  final Message? lastMessage;
  final int unreadCount;

  const Conversation({
    required this.id,
    required this.widgetId,
    this.visitorId,
    this.assignedTo,
    required this.status,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
    this.lastMessage,
    this.unreadCount = 0,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) =>
      _$ConversationFromJson(json);
  Map<String, dynamic> toJson() => _$ConversationToJson(this);

  @override
  List<Object?> get props => [
        id,
        widgetId,
        visitorId,
        assignedTo,
        status,
        metadata,
        createdAt,
        updatedAt,
        lastMessage,
        unreadCount,
      ];
}

enum ConversationStatus {
  @JsonValue('active')
  active,
  @JsonValue('pending')
  pending,
  @JsonValue('closed')
  closed,
  @JsonValue('archived')
  archived,
}

@JsonSerializable()
class Message extends Equatable {
  final String id;
  final String conversationId;
  final String senderId;
  final MessageSender senderType;
  final String content;
  final MessageType type;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final bool isRead;

  const Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderType,
    required this.content,
    required this.type,
    this.metadata,
    required this.createdAt,
    this.isRead = false,
  });

  factory Message.fromJson(Map<String, dynamic> json) =>
      _$MessageFromJson(json);
  Map<String, dynamic> toJson() => _$MessageToJson(this);

  @override
  List<Object?> get props => [
        id,
        conversationId,
        senderId,
        senderType,
        content,
        type,
        metadata,
        createdAt,
        isRead,
      ];
}

enum MessageSender {
  @JsonValue('user')
  user,
  @JsonValue('visitor')
  visitor,
  @JsonValue('system')
  system,
  @JsonValue('ai')
  ai,
}

enum MessageType {
  @JsonValue('text')
  text,
  @JsonValue('image')
  image,
  @JsonValue('file')
  file,
  @JsonValue('system')
  system,
}

@JsonSerializable()
class SendMessageRequest {
  final String content;
  final MessageType type;
  final Map<String, dynamic>? metadata;

  const SendMessageRequest({
    required this.content,
    this.type = MessageType.text,
    this.metadata,
  });

  Map<String, dynamic> toJson() => _$SendMessageRequestToJson(this);
}

@JsonSerializable()
class PaginatedResponse<T> {
  final List<T> items;
  final int page;
  final int limit;
  final int total;
  final int totalPages;

  const PaginatedResponse({
    required this.items,
    required this.page,
    required this.limit,
    required this.total,
    required this.totalPages,
  });

  factory PaginatedResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Object? json) fromJsonT,
  ) {
    return PaginatedResponse<T>(
      items: (json['items'] as List<dynamic>).map((e) => fromJsonT(e)).toList(),
      page: json['page'] as int,
      limit: json['limit'] as int,
      total: json['total'] as int,
      totalPages: json['totalPages'] as int,
    );
  }
}
