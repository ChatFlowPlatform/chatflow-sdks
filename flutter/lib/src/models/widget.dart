import 'package:equatable/equatable.dart';
import 'package:json_annotation/json_annotation.dart';

part 'widget.g.dart';

@JsonSerializable()
class Widget extends Equatable {
  final String id;
  final String workspaceId;
  final String name;
  final WidgetSettings settings;
  final WidgetStatus status;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Widget({
    required this.id,
    required this.workspaceId,
    required this.name,
    required this.settings,
    required this.status,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Widget.fromJson(Map<String, dynamic> json) => _$WidgetFromJson(json);
  Map<String, dynamic> toJson() => _$WidgetToJson(this);

  @override
  List<Object?> get props =>
      [id, workspaceId, name, settings, status, createdAt, updatedAt];
}

enum WidgetStatus {
  @JsonValue('active')
  active,
  @JsonValue('inactive')
  inactive,
}

@JsonSerializable()
class WidgetSettings extends Equatable {
  final String primaryColor;
  final String position;
  final String welcomeMessage;
  final bool enableAI;
  final List<String> allowedDomains;

  const WidgetSettings({
    required this.primaryColor,
    required this.position,
    required this.welcomeMessage,
    this.enableAI = true,
    this.allowedDomains = const [],
  });

  factory WidgetSettings.fromJson(Map<String, dynamic> json) =>
      _$WidgetSettingsFromJson(json);
  Map<String, dynamic> toJson() => _$WidgetSettingsToJson(this);

  @override
  List<Object?> get props =>
      [primaryColor, position, welcomeMessage, enableAI, allowedDomains];
}
