import { eq, and } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { lesson_progress, NewLessonProgress, LessonProgress } from '../db/schema';

export class LessonProgressRepository {
    async findAll(limit: number, offset: number): Promise<LessonProgress[]> {
        return await db.select().from(lesson_progress).limit(limit).offset(offset);
    }

    async findById(progressId: string): Promise<LessonProgress | undefined> {
        const rows = await db.select().from(lesson_progress).where(eq(lesson_progress.progress_id, progressId)).limit(1);
        return rows[0];
    }

    async findByEnrollmentAndLesson(enrollmentId: string, lessonId: string): Promise<LessonProgress | undefined> {
        const rows = await db.select().from(lesson_progress)
            .where(and(eq(lesson_progress.enrollment_id, enrollmentId), eq(lesson_progress.lesson_id, lessonId)))
            .limit(1);
        return rows[0];
    }

    async findByEnrollment(enrollmentId: string): Promise<LessonProgress[]> {
        return await db.select().from(lesson_progress).where(eq(lesson_progress.enrollment_id, enrollmentId));
    }

    async create(data: NewLessonProgress): Promise<LessonProgress> {
        const [created] = await db.insert(lesson_progress).values(data).returning();
        return created;
    }

    async update(progressId: string, data: Partial<NewLessonProgress>): Promise<LessonProgress | undefined> {
        const [updated] = await db
            .update(lesson_progress)
            .set(data)
            .where(eq(lesson_progress.progress_id, progressId))
            .returning();
        return updated;
    }

    async delete(progressId: string): Promise<LessonProgress | undefined> {
        const [deleted] = await db.delete(lesson_progress).where(eq(lesson_progress.progress_id, progressId)).returning();
        return deleted;
    }
}
