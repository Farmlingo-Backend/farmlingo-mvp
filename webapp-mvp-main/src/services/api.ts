import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include Clerk auth token if available
api.interceptors.request.use(async (config) => {
  try {
    // Get Clerk session token for authenticated requests
    const clerk = (window as any).Clerk;
    if (clerk && clerk.session && typeof clerk.session.getToken === 'function') {
      const token = await clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    // If token retrieval fails, continue without auth header
    console.warn('Failed to get auth token:', error);
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export interface Course {
  course_id: string;
  title: string;
  description?: string;
  category?: string;
  language?: string;
  thumbnail_url?: string;
  total_lessons?: number;
  total_duration_minutes?: number;
  average_rating?: number;
  rating_count?: number;
  status: string;
  creator_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedCoursesResponse {
  data: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  created_at?: string;
  is_active: boolean;
}

export interface Chatroom {
  chatroom_id: string;
  chatroom_type: string;
  name: string;
  description?: string;
  avatar_url?: string;
  created_by: string;
  member_count: number;
  last_message_id?: string;
  last_activity?: string;
  settings?: any;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export const coursesApi = {
  getCourses: async (page = 1, limit = 10): Promise<PaginatedCoursesResponse> => {
    const response = await api.get(`/courses?page=${page}&limit=${limit}`);
    return response.data;
  },

  getCourseById: async (courseId: string): Promise<Course> => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },
};

export interface ChatMessage {
  message_id: string;
  chatroom_id: string;
  user_id: string;
  content: string;
  message_type: string;
  reply_to_message_id?: string;
  metadata?: any;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
  deleted_at?: string;
}

export interface PaginatedMessagesResponse {
  data: ChatMessage[];
  pagination: {
    page: number;
    limit: number;
  };
}

export interface ChatroomMember {
  member_id: string;
  chatroom_id: string;
  user_id: string;
  role: string;
  permissions?: any;
  joined_at: string;
  last_read_at?: string;
  unread_count: number;
  is_muted: boolean;
  is_pinned: boolean;
  status: string;
  invited_by?: string;
}

export const chatroomsApi = {
  createChatroom: async (data: {
    chatroom_type: string;
    name: string;
    description?: string;
    avatar_url?: string;
    settings?: any;
  }): Promise<Chatroom> => {
    const response = await api.post('/chatrooms', data);
    return response.data;
  },

  getChatrooms: async (): Promise<{ data: Chatroom[]; pagination: any }> => {
    const response = await api.get('/chatrooms');
    return response.data;
  },

  getChatroomById: async (chatroomId: string): Promise<Chatroom> => {
    const response = await api.get(`/chatrooms/${chatroomId}`);
    return response.data;
  },

  getChatMessages: async (
    chatroomId: string,
    page = 1,
    limit = 50
  ): Promise<PaginatedMessagesResponse> => {
    const response = await api.get(`/chatrooms/${chatroomId}/messages?page=${page}&limit=${limit}`);
    return response.data;
  },

  sendMessage: async (
    chatroomId: string,
    data: {
      content: string;
      message_type?: string;
      reply_to_message_id?: string;
      metadata?: any;
    }
  ): Promise<ChatMessage> => {
    const response = await api.post(`/chatrooms/${chatroomId}/messages`, data);
    return response.data;
  },

  editMessage: async (
    chatroomId: string,
    messageId: string,
    data: { content: string }
  ): Promise<ChatMessage> => {
    const response = await api.put(`/chatrooms/${chatroomId}/messages/${messageId}`, data);
    return response.data;
  },

  deleteMessage: async (chatroomId: string, messageId: string): Promise<void> => {
    await api.delete(`/chatrooms/${chatroomId}/messages/${messageId}`);
  },

  addReaction: async (
    chatroomId: string,
    messageId: string,
    data: { emoji: string }
  ): Promise<any> => {
    const response = await api.post(`/chatrooms/${chatroomId}/messages/${messageId}/reactions`, data);
    return response.data;
  },

  clearChatHistory: async (chatroomId: string): Promise<void> => {
    await api.delete(`/chatrooms/${chatroomId}/clear-history`);
  },

  getChatroomMembers: async (chatroomId: string): Promise<{ success: boolean; data: ChatroomMember[] }> => {
    const response = await api.get(`/chatrooms/${chatroomId}/members`);
    return response.data;
  },

  requestMembership: async (
    chatroomId: string,
    data: { message?: string }
  ): Promise<any> => {
    const response = await api.post(`/chatrooms/${chatroomId}/members/request`, data);
    return response.data;
  },

  leaveChatroom: async (chatroomId: string): Promise<any> => {
    const response = await api.post(`/chatrooms/${chatroomId}/leave`);
    return response.data;
  },
};

export const chatsApi = {
  getUserChats: async (): Promise<{ success: boolean; data: any[] }> => {
    const response = await api.get('/chats/user');
    return response.data;
  },

  createDirectChat: async (data: { userId1: string; userId2: string }): Promise<{ success: boolean; data: any }> => {
    const response = await api.post('/chats/direct', data);
    return response.data;
  },

  getMessages: async (chatId: string, limit = 50, offset = 0): Promise<{ success: boolean; data: any[] }> => {
    const response = await api.get(`/chats/direct/${chatId}/messages?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  sendMessage: async (chatId: string, data: { content?: string; attachments?: any[] }): Promise<{ success: boolean; data: any }> => {
    const response = await api.post(`/chats/direct/${chatId}/messages`, data);
    return response.data;
  },
};

export const usersApi = {
  getUsers: async (): Promise<{ users: User[] }> => {
    const response = await api.get('/users');
    return response.data;
  },

  getCurrentUser: async (): Promise<{ success: boolean; data: User }> => {
    const response = await api.get('/users/me');
    return response.data;
  },

  syncUser: async (userData?: any): Promise<{ success: boolean }> => {
    const response = await api.post('/users/sync', userData || {});
    return response.data;
  },
};

export default api;
