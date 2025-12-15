import { eq, and } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { lessons, NewLesson, Lesson } from '../db/schema';

export class LessonRepository {
    async findAll(limit: number, offset: number, courseId?: string): Promise<Lesson[]> {
        if (courseId) {
            return await db.select().from(lessons).where(eq(lessons.course_id, courseId)).limit(limit).offset(offset);
        }
        return await db.select().from(lessons).limit(limit).offset(offset);
    }

    async findById(lessonId: string): Promise<Lesson | undefined> {
        const rows = await db.select().from(lessons).where(eq(lessons.lesson_id, lessonId)).limit(1);
        return rows[0];
    }

    async create(data: NewLesson): Promise<Lesson> {
        const [created] = await db.insert(lessons).values(data).returning();
        return created;
    }

    async update(lessonId: string, data: Partial<NewLesson>): Promise<Lesson | undefined> {
        const [updated] = await db
            .update(lessons)
            .set({ ...data, updated_at: new Date() })
            .where(eq(lessons.lesson_id, lessonId))
            .returning();
        return updated;
    }

    async delete(lessonId: string): Promise<Lesson | undefined> {
        const [deleted] = await db.delete(lessons).where(eq(lessons.lesson_id, lessonId)).returning();
        return deleted;
    }
}
