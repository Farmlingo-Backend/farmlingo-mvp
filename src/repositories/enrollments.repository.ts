import { eq, and } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { course_enrollments, NewCourseEnrollment, CourseEnrollment } from '../db/schema';

export class EnrollmentRepository {
    async findAll(limit: number, offset: number, userId?: string, courseId?: string): Promise<CourseEnrollment[]> {
        if (userId && courseId) {
            return await db
                .select()
                .from(course_enrollments)
                .where(and(eq(course_enrollments.user_id, userId), eq(course_enrollments.course_id, courseId)))
                .limit(limit)
                .offset(offset);
        } else if (userId) {
            return await db
                .select()
                .from(course_enrollments)
                .where(eq(course_enrollments.user_id, userId))
                .limit(limit)
                .offset(offset);
        } else if (courseId) {
            return await db
                .select()
                .from(course_enrollments)
                .where(eq(course_enrollments.course_id, courseId))
                .limit(limit)
                .offset(offset);
        }
        return await db.select().from(course_enrollments).limit(limit).offset(offset);
    }

    async findById(enrollmentId: string): Promise<CourseEnrollment | undefined> {
        const rows = await db.select().from(course_enrollments).where(eq(course_enrollments.enrollment_id, enrollmentId)).limit(1);
        return rows[0];
    }

    async create(data: NewCourseEnrollment): Promise<CourseEnrollment> {
        const [created] = await db.insert(course_enrollments).values(data).returning();
        return created;
    }

    async update(enrollmentId: string, data: Partial<NewCourseEnrollment>): Promise<CourseEnrollment | undefined> {
        const [updated] = await db
            .update(course_enrollments)
            .set(data)
            .where(eq(course_enrollments.enrollment_id, enrollmentId))
            .returning();
        return updated;
    }

    async delete(enrollmentId: string): Promise<CourseEnrollment | undefined> {
        const [deleted] = await db.delete(course_enrollments).where(eq(course_enrollments.enrollment_id, enrollmentId)).returning();
        return deleted;
    }
}
