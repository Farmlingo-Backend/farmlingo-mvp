import { eq } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { course_certificates, NewCourseCertificate, CourseCertificate } from '../db/schema';

export class CourseCertificateRepository {
    async findAll(limit: number, offset: number): Promise<CourseCertificate[]> {
        return await db.select().from(course_certificates).limit(limit).offset(offset);
    }

    async findById(certificateId: string): Promise<CourseCertificate | undefined> {
        const rows = await db.select().from(course_certificates).where(eq(course_certificates.certificate_id, certificateId)).limit(1);
        return rows[0];
    }

    async findByEnrollment(enrollmentId: string): Promise<CourseCertificate | undefined> {
        const rows = await db.select().from(course_certificates).where(eq(course_certificates.enrollment_id, enrollmentId)).limit(1);
        return rows[0];
    }

    async findByUser(userId: string): Promise<CourseCertificate[]> {
        return await db.select().from(course_certificates)
            .where(eq(course_certificates.certificate_id, userId));
    }

    async create(data: NewCourseCertificate): Promise<CourseCertificate> {
        const [created] = await db.insert(course_certificates).values(data).returning();
        return created;
    }

    async update(certificateId: string, data: Partial<NewCourseCertificate>): Promise<CourseCertificate | undefined> {
        const [updated] = await db
            .update(course_certificates)
            .set(data)
            .where(eq(course_certificates.certificate_id, certificateId))
            .returning();
        return updated;
    }

    async delete(certificateId: string): Promise<CourseCertificate | undefined> {
        const [deleted] = await db.delete(course_certificates).where(eq(course_certificates.certificate_id, certificateId)).returning();
        return deleted;
    }
}
