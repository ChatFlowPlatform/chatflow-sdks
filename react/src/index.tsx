export { AIChatProvider, useAIChat } from './context';
export { useAuth } from './useAuth';
export { useChat } from './useChat';
export { useWebSocket } from './useWebSocket';

// Re-export types from base SDK
export type {
  AIChatConfig,
  User,
  AuthResponse,
  Message,
  Conversation,
  Workspace,
} from '@aichat/sdk';
