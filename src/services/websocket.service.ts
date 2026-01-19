import { Server, Socket } from 'socket.io';
import { chatService } from './chat.service';
import { ChatMessage, MessageType, WebSocketEvents, WebSocketResponses } from '../types/chat.types';

interface ConnectedUser {
  userId: string;
  socketId: string;
  lastSeen: Date;
}

interface TypingUser {
  userId: string;
  chatId: string;
  timeout: NodeJS.Timeout;
}

export class WebSocketService {
  private io: Server | null = null;
  private connectedUsers: Map<string, ConnectedUser> = new Map();
  private typingUsers: Map<string, TypingUser[]> = new Map();

  initialize(server: any): void {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });

    console.log('WebSocket service initialized');
  }

  private handleConnection(socket: Socket): void {
    console.log(`User connected: ${socket.id}`);

    // Authenticate user (you'll need to implement this based on your auth system)
    socket.on('authenticate', (data: { userId: string; token?: string }) => {
      this.authenticateUser(socket, data.userId);
    });

    // Handle chat events
    socket.on('join_chat', (chatId: string) => {
      this.handleJoinChat(socket, chatId);
    });

    socket.on('leave_chat', (chatId: string) => {
      this.handleLeaveChat(socket, chatId);
    });

    socket.on('send_message', (data) => {
      this.handleSendMessage(socket, data);
    });

    socket.on('edit_message', (data) => {
      this.handleEditMessage(socket, data);
    });

    socket.on('delete_message', (data) => {
      this.handleDeleteMessage(socket, data);
    });

    socket.on('add_reaction', (data) => {
      this.handleAddReaction(socket, data);
    });

    socket.on('typing_start', (chatId: string) => {
      this.handleTypingStart(socket, chatId);
    });

    socket.on('typing_stop', (chatId: string) => {
      this.handleTypingStop(socket, chatId);
    });

    // Handle admin events
    socket.on('admin_broadcast', (data) => {
      this.handleAdminBroadcast(socket, data);
    });

    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  private authenticateUser(socket: Socket, userId: string): void {
    const connectedUser: ConnectedUser = {
      userId,
      socketId: socket.id,
      lastSeen: new Date()
    };

    this.connectedUsers.set(userId, connectedUser);

    // Send confirmation
    socket.emit('connected', {
      userId,
      sessionId: socket.id
    } as WebSocketResponses['connected']);

    // Notify others that user is online
    socket.broadcast.emit('user_online', { userId });

    console.log(`User ${userId} authenticated`);
  }

  private handleJoinChat(socket: Socket, chatId: string): void {
    const user = this.getUserFromSocket(socket);
    if (!user) return;

    socket.join(chatId);

    // Get current participants
    const participants = this.getChatParticipants(chatId);

    socket.emit('chat_joined', {
      chatId,
      participants: participants.map(p => p.userId)
    } as WebSocketResponses['chat_joined']);

    console.log(`User ${user.userId} joined chat ${chatId}`);
  }

  private handleLeaveChat(socket: Socket, chatId: string): void {
    const user = this.getUserFromSocket(socket);
    if (!user) return;

    socket.leave(chatId);
    console.log(`User ${user.userId} left chat ${chatId}`);
  }

  private async handleSendMessage(socket: Socket, data: {
    chatId: string;
    content: string;
    messageType?: MessageType;
    replyToMessageId?: string;
  }): Promise<void> {
    const user = this.getUserFromSocket(socket);
    if (!user) return;

    try {
      const message = await chatService.sendMessage(
        data.chatId,
        user.userId,
        data.content,
        data.messageType,
        data.replyToMessageId
      );

      // Broadcast to all users in the chat room
      this.io?.to(data.chatId).emit('new_message', message);

      console.log(`Message sent by ${user.userId} in chat ${data.chatId}`);
    } catch (error) {
      socket.emit('error', {
        type: 'send_message_error',
        message: error instanceof Error ? error.message : 'Failed to send message'
      });
    }
  }

  private async handleEditMessage(socket: Socket, data: {
    messageId: string;
    content: string;
  }): Promise<void> {
    const user = this.getUserFromSocket(socket);
    if (!user) return;

    try {
      const updatedMessage = await chatService.editMessage(
        data.messageId,
        user.userId,
        data.content
      );

      // Broadcast to all users in the chat room
      this.io?.to(updatedMessage.chatId).emit('message_edited', {
        messageId: data.messageId,
        content: data.content,
        editedAt: new Date()
      } as WebSocketResponses['message_edited']);

    } catch (error) {
      socket.emit('error', {
        type: 'edit_message_error',
        message: error instanceof Error ? error.message : 'Failed to edit message'
      });
    }
  }

  private async handleDeleteMessage(socket: Socket, data: {
    messageId: string;
  }): Promise<void> {
    const user = this.getUserFromSocket(socket);
    if (!user) return;

    try {
      // Get message to find chat ID before deletion
      const messages = await chatService.getChatMessages('', user.userId, 1, 1);
      const message = messages.messages.find(m => m.messageId === data.messageId);

      if (!message) {
        throw new Error('Message not found');
      }

      await chatService.deleteMessage(data.messageId, user.userId);

      // Broadcast to all users in the chat room
      this.io?.to(message.chatId).emit('message_deleted', {
        messageId: data.messageId,
        deletedAt: new Date()
      } as WebSocketResponses['message_deleted']);

    } catch (error) {
      socket.emit('error', {
        type: 'delete_message_error',
        message: error instanceof Error ? error.message : 'Failed to delete message'
      });
    }
  }

  private async handleAddReaction(socket: Socket, data: {
    messageId: string;
    emoji: string;
  }): Promise<void> {
    const user = this.getUserFromSocket(socket);
    if (!user) return;

    try {
      await chatService.addReaction(data.messageId, user.userId, data.emoji);

      // Get message to find chat ID
      const messages = await chatService.getChatMessages('', user.userId, 1, 1);
      const message = messages.messages.find(m => m.messageId === data.messageId);

      if (message) {
        const reaction = {
          reactionId: `${data.messageId}_${user.userId}_${data.emoji}`,
          userId: user.userId,
          emoji: data.emoji,
          createdAt: new Date()
        };

        // Broadcast to all users in the chat room
        this.io?.to(message.chatId).emit('reaction_added', reaction);
      }

    } catch (error) {
      socket.emit('error', {
        type: 'add_reaction_error',
        message: error instanceof Error ? error.message : 'Failed to add reaction'
      });
    }
  }

  private handleTypingStart(socket: Socket, chatId: string): void {
    const user = this.getUserFromSocket(socket);
    if (!user) return;

    // Clear existing typing timeout for this user in this chat
    const chatTypingUsers = this.typingUsers.get(chatId) || [];
    const existingTyping = chatTypingUsers.find(t => t.userId === user.userId);

    if (existingTyping) {
      clearTimeout(existingTyping.timeout);
    }

    // Add user to typing list
    const typingUser: TypingUser = {
      userId: user.userId,
      chatId,
      timeout: setTimeout(() => {
        this.handleTypingStop(socket, chatId);
      }, 3000) // Auto-stop typing after 3 seconds
    };

    const updatedTypingUsers = chatTypingUsers.filter(t => t.userId !== user.userId);
    updatedTypingUsers.push(typingUser);
    this.typingUsers.set(chatId, updatedTypingUsers);

    // Broadcast typing status
    this.io?.to(chatId).emit('user_typing', {
      userId: user.userId,
      chatId
    } as WebSocketResponses['user_typing']);
  }

  private handleTypingStop(socket: Socket, chatId: string): void {
    const user = this.getUserFromSocket(socket);
    if (!user) return;

    const chatTypingUsers = this.typingUsers.get(chatId) || [];
    const updatedTypingUsers = chatTypingUsers.filter(t => t.userId !== user.userId);
    this.typingUsers.set(chatId, updatedTypingUsers);

    // Broadcast typing stop
    this.io?.to(chatId).emit('user_stopped_typing', {
      userId: user.userId,
      chatId
    } as WebSocketResponses['user_stopped_typing']);
  }

  private handleAdminBroadcast(socket: Socket, data: {
    message: string;
    targetUsers?: string[];
  }): void {
    const user = this.getUserFromSocket(socket);
    if (!user) return;

    // Check if user is admin (you should implement proper admin check)
    const isAdmin = true; // Replace with actual admin check

    if (!isAdmin) {
      socket.emit('error', {
        type: 'admin_broadcast_error',
        message: 'Insufficient permissions'
      });
      return;
    }

    const message = {
      message: data.message,
      from: user.userId,
      timestamp: new Date()
    };

    if (data.targetUsers) {
      // Send to specific users
      data.targetUsers.forEach(targetUserId => {
        const targetUser = this.connectedUsers.get(targetUserId);
        if (targetUser) {
          this.io?.to(targetUser.socketId).emit('admin_message', message);
        }
      });
    } else {
      // Broadcast to all connected users
      this.io?.emit('admin_message', message);
    }
  }

  private handleDisconnect(socket: Socket): void {
    const user = Array.from(this.connectedUsers.values())
      .find(u => u.socketId === socket.id);

    if (user) {
      this.connectedUsers.delete(user.userId);

      // Notify others that user is offline
      socket.broadcast.emit('user_offline', { userId: user.userId });

      console.log(`User ${user.userId} disconnected`);
    }

    console.log(`Socket ${socket.id} disconnected`);
  }

  private getUserFromSocket(socket: Socket): ConnectedUser | null {
    return Array.from(this.connectedUsers.values())
      .find(u => u.socketId === socket.id) || null;
  }

  private getChatParticipants(chatId: string): ConnectedUser[] {
    const room = this.io?.sockets.adapter.rooms.get(chatId);
    if (!room) return [];

    const participants: ConnectedUser[] = [];
    for (const socketId of room) {
      const user = Array.from(this.connectedUsers.values())
        .find(u => u.socketId === socketId);
      if (user) {
        participants.push(user);
      }
    }

    return participants;
  }

  // Public methods for external use
  public getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  public getOnlineUsersCount(): number {
    return this.connectedUsers.size;
  }

  public isUserOnline(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }

  public broadcastToChat(chatId: string, event: string, data: any): void {
    this.io?.to(chatId).emit(event, data);
  }

  public sendToUser(userId: string, event: string, data: any): void {
    const user = this.connectedUsers.get(userId);
    if (user) {
      this.io?.to(user.socketId).emit(event, data);
    }
  }
}

export const websocketService = new WebSocketService();
