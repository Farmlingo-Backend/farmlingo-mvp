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

  // Frontend-specific fields (computed or for display)
  progress?: number;
  learningPath?: string;
  instructor?: string;
  level?: 'Beginner' | 'Intermediate' | 'Advanced';
  price?: number;
  modules?: number;
  hours?: number;
  image?: string;
}

export interface LearningPath {
  id: string;
  name: string;
}
