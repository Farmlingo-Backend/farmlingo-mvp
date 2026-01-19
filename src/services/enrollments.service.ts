import { CourseEnrollmentRepository } from '../repositories/enrollments.repository';
import { NewCourseEnrollment, CourseEnrollment } from '../db/schema';

export class EnrollmentService {
    private enrollmentRepo: CourseEnrollmentRepository;

    constructor() {
        this.enrollmentRepo = new CourseEnrollmentRepository();
    }

    async getEnrollments(
        page: number,
        limit: number,
        userId?: string,
        courseId?: string
    ): Promise<{ data: CourseEnrollment[]; pagination: { page: number; limit: number } }> {
        try {
            // Input validation
            if (page < 1) {
                throw new Error('Page must be greater than 0');
            }
            if (limit < 1) {
                throw new Error('Limit must be greater than 0');
            }

            const offset = (page - 1) * limit;
            const data = await this.enrollmentRepo.findAll(limit, offset, userId, courseId);
            return { data, pagination: { page, limit } };
        } catch (error) {
            throw new Error(`Failed to get enrollments: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async getEnrollmentById(enrollmentId: string): Promise<CourseEnrollment | undefined> {
        try {
            // Input validation
            if (!enrollmentId) {
                throw new Error('Enrollment ID is required');
            }

            return await this.enrollmentRepo.findById(enrollmentId);
        } catch (error) {
            throw new Error(`Failed to get enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async createEnrollment(data: NewCourseEnrollment): Promise<CourseEnrollment> {
        try {
            // Business logic validation
            if (!data.user_id || !data.course_id) {
                throw new Error('User ID and Course ID are required');
            }

            // Check for duplicate enrollment
            const existing = await this.enrollmentRepo.findByUserAndCourse(data.user_id, data.course_id);
            if (existing) {
                throw new Error('User is already enrolled in this course');
            }

            return await this.enrollmentRepo.create(data);
        } catch (error) {
            throw new Error(`Failed to create enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async updateEnrollment(enrollmentId: string, data: Partial<NewCourseEnrollment>): Promise<CourseEnrollment | undefined> {
        try {
            // Input validation
            if (!enrollmentId) {
                throw new Error('Enrollment ID is required');
            }

            // Check if enrollment exists
            const existing = await this.enrollmentRepo.findById(enrollmentId);
            if (!existing) {
                throw new Error('Enrollment not found');
            }

            return await this.enrollmentRepo.update(enrollmentId, data);
        } catch (error) {
            throw new Error(`Failed to update enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    async deleteEnrollment(enrollmentId: string): Promise<CourseEnrollment | undefined> {
        try {
            // Input validation
            if (!enrollmentId) {
                throw new Error('Enrollment ID is required');
            }

            // Check if enrollment exists
            const existing = await this.enrollmentRepo.findById(enrollmentId);
            if (!existing) {
                throw new Error('Enrollment not found');
            }

            return await this.enrollmentRepo.delete(enrollmentId);
        } catch (error) {
            throw new Error(`Failed to delete enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}

export const enrollmentService = new EnrollmentService();
