import { Lesson, LessonMedia, LessonProgress, Quiz } from '../db/schema';

export interface LessonMediaResult {
    media_id: string;
    lesson_id: string;
    media_type: string;
    media_url: string;
    media_title?: string;
    media_description?: string;
    created_at: Date;
}

export interface LessonProgressResult {
    progress_id: string;
    enrollment_id: string;
    lesson_id: string;
    status: 'not_started' | 'in_progress' | 'completed';
    progress_percentage: number;
    started_at?: Date;
    last_accessed: Date;
    completed_at?: Date;
}

export interface LessonQuizResult {
    quiz_id: string;
    lesson_id: string;
    quiz_title: string;
    quiz_description?: string;
    questions: any[];
    created_at: Date;
}

export interface LessonWithDetails {
    lesson_id: string;
    course_id: string;
    lesson_title: string;
    lesson_description?: string;
    lesson_order: number;
    created_at: Date;
    updated_at: Date;
    media: LessonMediaResult[];
    quiz: LessonQuizResult | null;
    progress: LessonProgressResult | null;
}

export interface LessonProgressUpdate {
    enrollment_id: string;
    lesson_id: string;
    status: 'not_started' | 'in_progress' | 'completed';
    progress_percentage?: number;
}
