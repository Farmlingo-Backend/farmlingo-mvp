import { eq, and } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { course_ratings, NewCourseRating, CourseRating } from '../db/schema';

export class CourseRatingRepository {
    async findAll(limit: number, offset: number): Promise<CourseRating[]> {
        return await db.select().from(course_ratings).limit(limit).offset(offset);
    }

    async findById(ratingId: string): Promise<CourseRating | undefined> {
        const rows = await db.select().from(course_ratings).where(eq(course_ratings.rating_id, ratingId)).limit(1);
        return rows[0];
    }

    async findByUserAndCourse(userId: string, courseId: string): Promise<CourseRating | undefined> {
        const rows = await db.select().from(course_ratings)
            .where(and(eq(course_ratings.user_id, userId), eq(course_ratings.course_id, courseId)))
            .limit(1);
        return rows[0];
    }

    async findByCourse(courseId: string, limit: number, offset: number): Promise<CourseRating[]> {
        return await db.select().from(course_ratings)
            .where(eq(course_ratings.course_id, courseId))
            .limit(limit)
            .offset(offset);
    }

    async create(data: NewCourseRating): Promise<CourseRating> {
        const [created] = await db.insert(course_ratings).values(data).returning();
        return created;
    }

    async update(ratingId: string, data: Partial<NewCourseRating>): Promise<CourseRating | undefined> {
        const [updated] = await db
            .update(course_ratings)
            .set(data)
            .where(eq(course_ratings.rating_id, ratingId))
            .returning();
        return updated;
    }

    async delete(ratingId: string): Promise<CourseRating | undefined> {
        const [deleted] = await db.delete(course_ratings).where(eq(course_ratings.rating_id, ratingId)).returning();
        return deleted;
    }
}
