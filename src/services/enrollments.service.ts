import { EnrollmentRepository } from '../repositories/enrollments.repository';
import { NewCourseEnrollment, CourseEnrollment } from '../db/schema';

export class EnrollmentService {
    private enrollmentRepo: EnrollmentRepository;

    constructor() {
        this.enrollmentRepo = new EnrollmentRepository();
    }

    async getEnrollments(
        page: number,
        limit: number,
        userId?: string,
        courseId?: string
    ): Promise<{ data: CourseEnrollment[]; pagination: { page: number; limit: number } }> {
        const offset = (page - 1) * limit;
        const data = await this.enrollmentRepo.findAll(limit, offset, userId, courseId);
        return { data, pagination: { page, limit } };
    }

    async getEnrollmentById(enrollmentId: string): Promise<CourseEnrollment | undefined> {
        return await this.enrollmentRepo.findById(enrollmentId);
    }

    async createEnrollment(data: NewCourseEnrollment): Promise<CourseEnrollment> {
        return await this.enrollmentRepo.create(data);
    }

    async updateEnrollment(enrollmentId: string, data: Partial<NewCourseEnrollment>): Promise<CourseEnrollment | undefined> {
        return await this.enrollmentRepo.update(enrollmentId, data);
    }

    async deleteEnrollment(enrollmentId: string): Promise<CourseEnrollment | undefined> {
        return await this.enrollmentRepo.delete(enrollmentId);
    }
}

export const enrollmentService = new EnrollmentService();
