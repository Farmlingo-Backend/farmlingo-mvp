import { LessonRepository } from '../repositories/lessons.repository';
import { NewLesson, Lesson } from '../db/schema';

export class LessonService {
    private lessonRepo: LessonRepository;

    constructor() {
        this.lessonRepo = new LessonRepository();
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
}

export const lessonService = new LessonService();
