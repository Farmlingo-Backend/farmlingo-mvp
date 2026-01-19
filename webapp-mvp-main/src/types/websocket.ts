export type MessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'system';

export interface ChatMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  replyToMessageId?: string;
  attachments?: any[];
  reactions?: any[];
  metadata?: Record<string, any>;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface WebSocketEvents {
  // Connection events
  'connect': () => void;
  'disconnect': () => void;

  // Chat events
  'join_chat': (chatId: string) => void;
  'leave_chat': (chatId: string) => void;
  'send_message': (data: { chatId: string; content: string; messageType?: MessageType; replyToMessageId?: string }) => void;
  'edit_message': (data: { messageId: string; content: string }) => void;
  'delete_message': (data: { messageId: string }) => void;
  'add_reaction': (data: { messageId: string; emoji: string }) => void;

  // Typing indicators
  'typing_start': (chatId: string) => void;
  'typing_stop': (chatId: string) => void;

  // Admin events
  'admin_broadcast': (data: { message: string; targetUsers?: string[] }) => void;
  'user_banned': (data: { userId: string; reason: string }) => void;
}

export interface WebSocketResponses {
  // Connection responses
  'connected': { userId: string; sessionId: string };

  // Chat responses
  'chat_joined': { chatId: string; participants: string[] };
  'new_message': ChatMessage;
  'message_edited': { messageId: string; content: string; editedAt: Date };
  'message_deleted': { messageId: string; deletedAt: Date };
  'reaction_added': any;

  // Typing responses
  'user_typing': { userId: string; chatId: string };
  'user_stopped_typing': { userId: string; chatId: string };
  'typing_users': { chatId: string; users: string[] };

  // Admin responses
  'admin_message': { message: string; from: string; timestamp: Date };
  'user_kicked': { userId: string; chatId: string; reason: string };

  // Error responses
  'error': { type: string; message: string; code?: number };

  // System responses
  'user_online': { userId: string };
  'user_offline': { userId: string };
  'chat_updated': any;
}
