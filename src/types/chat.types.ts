export enum ChatType {
  DIRECT = 'direct',
  GROUP = 'group',
  TOPIC_BASED = 'topic_based'
}

export enum ChatMemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member'
}

export enum ChatMemberStatus {
  ACTIVE = 'active',
  LEFT = 'left',
  REMOVED = 'removed',
  BANNED = 'banned'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  FILE = 'file',
  SYSTEM = 'system'
}

export enum ModerationAction {
  ALLOW = 'allow',
  BLOCK = 'block',
  FLAG = 'flag',
  DELETE = 'delete',
  WARN = 'warn'
}

export enum MembershipRequestStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled'
}

export enum MembershipAction {
  JOIN = 'join',
  LEAVE = 'leave',
  ADDED = 'added',
  REMOVED = 'removed',
  ROLE_CHANGED = 'role_changed',
  BANNED = 'banned',
  UNBANNED = 'unbanned'
}

export enum NotificationType {
  MESSAGE = 'message',
  MEMBER_JOIN = 'member_join',
  MEMBER_LEAVE = 'member_leave',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  INVITATION = 'invitation',
  REQUEST_APPROVED = 'request_approved',
  REQUEST_REJECTED = 'request_rejected'
}

export interface ChatParticipant {
  userId: string;
  role: ChatMemberRole;
  joinedAt: Date;
  lastReadAt?: Date;
  status: ChatMemberStatus;
  permissions?: Record<string, boolean>;
}

export interface ChatMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  replyToMessageId?: string;
  attachments?: MessageAttachment[];
  reactions?: MessageReaction[];
  metadata?: Record<string, any>;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}

export interface MessageAttachment {
  attachmentId: string;
  fileUrl: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'pdf';
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface MessageReaction {
  reactionId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface ChatRoom {
  chatId: string;
  type: ChatType;
  name?: string;
  description?: string;
  avatarUrl?: string;
  createdBy: string;
  participants: ChatParticipant[];
  lastMessage?: ChatMessage;
  lastActivity: Date;
  settings?: Record<string, any>;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt?: Date;
}

export interface ModerationResult {
  action: ModerationAction;
  reason?: string;
  confidence?: number;
  flaggedContent?: string[];
}

export interface SpamScore {
  score: number;
  reasons: string[];
  confidence: number;
}

export interface UserBehavior {
  messageFrequency: number;
  spamIndicators: number;
  riskScore: number;
  lastActivity: Date;
  flaggedMessages: number;
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
  'reaction_added': MessageReaction;

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
  'chat_updated': Partial<ChatRoom>;
}
