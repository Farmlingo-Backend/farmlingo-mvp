import { eq } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { lesson_media, NewLessonMedia, LessonMedia } from '../db/schema';

export class LessonMediaRepository {
    async findAll(limit: number, offset: number): Promise<LessonMedia[]> {
        return await db.select().from(lesson_media).limit(limit).offset(offset);
    }

    async findById(mediaId: string): Promise<LessonMedia | undefined> {
        const rows = await db.select().from(lesson_media).where(eq(lesson_media.media_id, mediaId)).limit(1);
        return rows[0];
    }

    async findByLesson(lessonId: string): Promise<LessonMedia[]> {
        return await db.select().from(lesson_media).where(eq(lesson_media.lesson_id, lessonId));
    }

    async create(data: NewLessonMedia): Promise<LessonMedia> {
        const [created] = await db.insert(lesson_media).values(data).returning();
        return created;
    }

    async update(mediaId: string, data: Partial<NewLessonMedia>): Promise<LessonMedia | undefined> {
        const [updated] = await db
            .update(lesson_media)
            .set(data)
            .where(eq(lesson_media.media_id, mediaId))
            .returning();
        return updated;
    }

    async delete(mediaId: string): Promise<LessonMedia | undefined> {
        const [deleted] = await db.delete(lesson_media).where(eq(lesson_media.media_id, mediaId)).returning();
        return deleted;
    }
}
