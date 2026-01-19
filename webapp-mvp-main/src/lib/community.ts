export interface User {
  id: number;
  name: string;
  avatar: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
}

export interface Reply {
  id: number;
  user: User;
  text: string;
  image?: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export interface Post {
  id: number;
  user: User;
  text: string;
  image?: string;
  timestamp: string;
  likes: number;
  replies: Reply[];
  isLiked: boolean;
  isBookmarked: boolean;
  categoryId?: number;
}

export interface ForumCategory {
  id: number;
  name: string;
  description: string;
  memberCount: number;
}