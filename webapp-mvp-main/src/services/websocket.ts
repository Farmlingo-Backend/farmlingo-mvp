import { io, Socket } from 'socket.io-client';
import type { WebSocketResponses, ChatMessage } from '../types/websocket';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Function[]> = new Map();

  connect(userId: string): void {
    // Use the same API URL as the REST API, but remove the /api prefix for WebSocket
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5006';
    const serverUrl = apiUrl.replace('/api', '') || 'http://localhost:5006';

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
      this.reconnectAttempts = 0;
      this.authenticate(userId);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from WebSocket:', reason);
      this.handleReconnect();
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  private authenticate(userId: string): void {
    if (this.socket) {
      this.socket.emit('authenticate', { userId });
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Chat events
    this.socket.on('chat_joined', (data: WebSocketResponses['chat_joined']) => {
      this.emit('chat_joined', data);
    });

    this.socket.on('new_message', (message: ChatMessage) => {
      this.emit('new_message', message);
    });

    this.socket.on('message_edited', (data: WebSocketResponses['message_edited']) => {
      this.emit('message_edited', data);
    });

    this.socket.on('message_deleted', (data: WebSocketResponses['message_deleted']) => {
      this.emit('message_deleted', data);
    });

    this.socket.on('reaction_added', (reaction: any) => {
      this.emit('reaction_added', reaction);
    });

    this.socket.on('user_typing', (data: WebSocketResponses['user_typing']) => {
      this.emit('user_typing', data);
    });

    this.socket.on('user_stopped_typing', (data: WebSocketResponses['user_stopped_typing']) => {
      this.emit('user_stopped_typing', data);
    });

    this.socket.on('user_online', (data: { userId: string }) => {
      this.emit('user_online', data);
    });

    this.socket.on('user_offline', (data: { userId: string }) => {
      this.emit('user_offline', data);
    });

    this.socket.on('error', (error: any) => {
      console.error('WebSocket error:', error);
      this.emit('error', error);
    });
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        if (this.socket) {
          this.socket.connect();
        }
      }, 1000 * this.reconnectAttempts); // Exponential backoff
    }
  }

  // Event emitter pattern
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // Chat methods
  joinChat(chatId: string): void {
    if (this.socket) {
      this.socket.emit('join_chat', chatId);
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket) {
      this.socket.emit('leave_chat', chatId);
    }
  }

  sendMessage(data: {
    chatId: string;
    content: string;
    messageType?: string;
    replyToMessageId?: string;
  }): void {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  editMessage(data: { messageId: string; content: string }): void {
    if (this.socket) {
      this.socket.emit('edit_message', data);
    }
  }

  deleteMessage(data: { messageId: string }): void {
    if (this.socket) {
      this.socket.emit('delete_message', data);
    }
  }

  addReaction(data: { messageId: string; emoji: string }): void {
    if (this.socket) {
      this.socket.emit('add_reaction', data);
    }
  }

  startTyping(chatId: string): void {
    if (this.socket) {
      this.socket.emit('typing_start', chatId);
    }
  }

  stopTyping(chatId: string): void {
    if (this.socket) {
      this.socket.emit('typing_stop', chatId);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const websocketService = new WebSocketService();
