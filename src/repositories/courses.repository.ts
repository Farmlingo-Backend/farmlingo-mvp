import { eq } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { courses, NewCourse, Course } from '../db/schema';

export class CourseRepository {
    /**
     * Find all courses with pagination
     */
    async findAll(limit: number, offset: number): Promise<Course[]> {
        return await db.select().from(courses).limit(limit).offset(offset);
    }

    /**
     * Find course by ID
     */
    async findById(courseId: string): Promise<Course | undefined> {
        const rows = await db.select().from(courses).where(eq(courses.course_id, courseId)).limit(1);
        return rows[0];
    }

    /**
     * Create a new course
     */
    async create(data: NewCourse): Promise<Course> {
        const [created] = await db.insert(courses).values(data).returning();
        return created;
    }

    /**
     * Update a course
     */
    async update(courseId: string, data: Partial<NewCourse>): Promise<Course | undefined> {
        const [updated] = await db
            .update(courses)
            .set({ ...data, updated_at: new Date() })
            .where(eq(courses.course_id, courseId))
            .returning();
        return updated;
    }

    /**
     * Delete a course
     */
    async delete(courseId: string): Promise<Course | undefined> {
        const [deleted] = await db.delete(courses).where(eq(courses.course_id, courseId)).returning();
        return deleted;
    }
}
