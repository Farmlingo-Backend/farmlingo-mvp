import { LessonRepository } from '../repositories/lessons.repository';
import { LessonMediaRepository } from '../repositories/lessonMedia.repository';
import { LessonProgressRepository } from '../repositories/lessonProgress.repository';
import { QuizzesRepository } from '../repositories/quizzes.repository';
import { NewLesson, Lesson, NewLessonMedia, NewLessonProgress, NewQuiz } from '../db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { LessonMediaResult, LessonProgressResult, LessonQuizResult, LessonWithDetails, LessonProgressUpdate } from '../types/lessonProgress';

export class LessonService {
    private lessonRepo: LessonRepository;
    private mediaRepo: LessonMediaRepository;
    private progressRepo: LessonProgressRepository;
    private quizRepo: QuizzesRepository;

    constructor() {
        this.lessonRepo = new LessonRepository();
        this.mediaRepo = new LessonMediaRepository();
        this.progressRepo = new LessonProgressRepository();
        this.quizRepo = new QuizzesRepository();
    }

    async getLessons(page: number, limit: number, courseId?: string): Promise<{ data: Lesson[]; pagination: { page: number; limit: number } }> {
        const offset = (page - 1) * limit;
        const data = await this.lessonRepo.findAll(limit, offset, courseId);
        return { data, pagination: { page, limit } };
    }

    async getLessonById(lessonId: string): Promise<Lesson | undefined> {
        return await this.lessonRepo.findById(lessonId);
    }

    async createLesson(data: NewLesson): Promise<Lesson> {
        return await this.lessonRepo.create(data);
    }

    async updateLesson(lessonId: string, data: Partial<NewLesson>): Promise<Lesson | undefined> {
        return await this.lessonRepo.update(lessonId, data);
    }

    async deleteLesson(lessonId: string): Promise<Lesson | undefined> {
        return await this.lessonRepo.delete(lessonId);
    }

    /**
     * Add media to a lesson
     */
    async addMediaToLesson(lessonId: string, mediaData: NewLessonMedia): Promise<LessonMediaResult> {
        try {
            const media: NewLessonMedia = {
                ...mediaData,
                lesson_id: lessonId
            };
            const createdMedia = await this.mediaRepo.create(media);
            return {
                media_id: createdMedia.media_id,
                lesson_id: createdMedia.lesson_id,
                media_type: createdMedia.media_type,
                media_url: createdMedia.file_url || '',
                media_title: createdMedia.file_label,
                media_description: undefined,
                created_at: createdMedia.created_at
            } as LessonMediaResult;
        } catch (error) {
            throw new Error(`Failed to add media to lesson: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get all media for a lesson
     */
    async getLessonMedia(lessonId: string): Promise<LessonMediaResult[]> {
        try {
            const mediaList = await this.mediaRepo.findByLesson(lessonId);
            return mediaList.map(media => ({
                media_id: media.media_id,
                lesson_id: media.lesson_id,
                media_type: media.media_type,
                media_url: media.file_url || '',
                media_title: media.file_label,
                media_description: undefined,
                created_at: media.created_at
            })) as LessonMediaResult[];
        } catch (error) {
            throw new Error(`Failed to get lesson media: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Update lesson progress for a user
     */
    async updateLessonProgress(enrollmentId: string, lessonId: string, status: 'not_started' | 'in_progress' | 'completed', progressPercentage?: number): Promise<LessonProgressResult> {
        try {
            // Validate status
            if (!['not_started', 'in_progress', 'completed'].includes(status)) {
                throw new Error('Invalid status. Must be one of: not_started, in_progress, completed');
            }

            // Validate progress percentage
            if (progressPercentage !== undefined && (progressPercentage < 0 || progressPercentage > 100)) {
                throw new Error('Progress percentage must be between 0 and 100');
            }

            // Check if progress record exists
            const existingProgress = await this.progressRepo.findByEnrollmentAndLesson(enrollmentId, lessonId);
            
            if (existingProgress) {
                const updatedProgress = await this.progressRepo.update(existingProgress.progress_id, {
                    status: status,
                    progress_percentage: progressPercentage || existingProgress.progress_percentage,
                    last_accessed: new Date()
                });
                return updatedProgress as LessonProgressResult;
            }

            // Create new progress record
            const progress: NewLessonProgress = {
                enrollment_id: enrollmentId,
                lesson_id: lessonId,
                status: status,
                progress_percentage: progressPercentage || 0,
                started_at: status === 'in_progress' ? new Date() : undefined,
                last_accessed: new Date()
            };

            const createdProgress = await this.progressRepo.create(progress);
            return createdProgress as LessonProgressResult;
        } catch (error) {
            throw new Error(`Failed to update lesson progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Complete a lesson
     */
    async completeLesson(enrollmentId: string, lessonId: string): Promise<LessonProgressResult> {
        try {
            return await this.updateLessonProgress(enrollmentId, lessonId, 'completed', 100);
        } catch (error) {
            throw new Error(`Failed to complete lesson: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get lesson progress for a user
     */
    async getLessonProgress(enrollmentId: string, lessonId: string): Promise<LessonProgressResult | null> {
        try {
            const progress = await this.progressRepo.findByEnrollmentAndLesson(enrollmentId, lessonId);
            return progress as LessonProgressResult | null;
        } catch (error) {
            throw new Error(`Failed to get lesson progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Add quiz to a lesson
     */
    async addQuizToLesson(lessonId: string, quizData: NewQuiz): Promise<LessonQuizResult> {
        try {
            const quiz: NewQuiz = {
                ...quizData,
                lesson_id: lessonId
            };
            const createdQuiz = await this.quizRepo.createQuiz(quiz);
            return {
                quiz_id: createdQuiz.quiz_id,
                lesson_id: createdQuiz.lesson_id,
                quiz_title: createdQuiz.title || '',
                quiz_description: createdQuiz.description,
                questions: [],
                created_at: createdQuiz.created_at
            } as LessonQuizResult;
        } catch (error) {
            throw new Error(`Failed to add quiz to lesson: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get quiz for a lesson
     */
    async getLessonQuiz(lessonId: string): Promise<LessonQuizResult | null> {
        try {
            const quiz = await this.quizRepo.findQuizByLessonId(lessonId);
            if (!quiz) return null;
            return {
                quiz_id: quiz.quiz_id,
                lesson_id: quiz.lesson_id,
                quiz_title: quiz.title || '',
                quiz_description: quiz.description,
                questions: [],
                created_at: quiz.created_at
            } as LessonQuizResult;
        } catch (error) {
            throw new Error(`Failed to get lesson quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get lesson with all related data (media, progress, quiz)
     */
    async getLessonWithDetails(lessonId: string, enrollmentId?: string): Promise<LessonWithDetails | null> {
        try {
            const lesson = await this.lessonRepo.findById(lessonId);
            if (!lesson) return null;

            const media = await this.getLessonMedia(lessonId);
            const quiz = await this.getLessonQuiz(lessonId);
            const progress = enrollmentId ? await this.getLessonProgress(enrollmentId, lessonId) : null;

            return {
                lesson_id: lesson.lesson_id,
                course_id: lesson.course_id,
                lesson_title: lesson.title,
                lesson_description: lesson.description,
                lesson_order: lesson.order_number,
                created_at: lesson.created_at,
                updated_at: lesson.updated_at,
                media,
                quiz,
                progress
            } as LessonWithDetails;
        } catch (error) {
            throw new Error(`Failed to get lesson details: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const lessonService = new LessonService();
