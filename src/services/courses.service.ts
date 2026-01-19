import { CourseRepository } from '../repositories/courses.repository';
import { CourseEnrollmentRepository } from '../repositories/enrollments.repository';
import { CourseRatingRepository } from '../repositories/courseRatings.repository';
import { CourseCertificateRepository } from '../repositories/courseCertificates.repository';
import { NewCourse, Course, NewCourseEnrollment, NewCourseRating, NewCourseCertificate, lessons, lesson_progress } from '../db/schema';
import { eq } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { CourseProgress, CourseCompletionResult, CourseRatingResult, CourseEnrollmentResult, CourseRatingsResponse } from '../types/courseProgress';

export class CourseService {
    private courseRepo: CourseRepository;
    private enrollmentRepo: CourseEnrollmentRepository;
    private ratingRepo: CourseRatingRepository;
    private certificateRepo: CourseCertificateRepository;

    constructor() {
        this.courseRepo = new CourseRepository();
        this.enrollmentRepo = new CourseEnrollmentRepository();
        this.ratingRepo = new CourseRatingRepository();
        this.certificateRepo = new CourseCertificateRepository();
    }

    async getCourses(page: number, limit: number): Promise<{ data: Course[]; pagination: { page: number; limit: number } }> {
        const offset = (page - 1) * limit;
        const data = await this.courseRepo.findAll(limit, offset);
        return { data, pagination: { page, limit } };
    }

    async getCourseById(courseId: string): Promise<Course | undefined> {
        return await this.courseRepo.findById(courseId);
    }

    async createCourse(data: NewCourse): Promise<Course> {
        return await this.courseRepo.create(data);
    }

    async updateCourse(courseId: string, data: Partial<NewCourse>): Promise<Course | undefined> {
        return await this.courseRepo.update(courseId, data);
    }

    async deleteCourse(courseId: string): Promise<Course | undefined> {
        return await this.courseRepo.delete(courseId);
    }

    /**
     * Enroll a user in a course
     */
    async enrollUser(userId: string, courseId: string): Promise<CourseEnrollmentResult> {
        try {
            // Check if user is already enrolled
            const existingEnrollment = await this.enrollmentRepo.findByUserAndCourse(userId, courseId);
            
            if (existingEnrollment) {
                return existingEnrollment as CourseEnrollmentResult;
            }

            // Create new enrollment
            const enrollment: NewCourseEnrollment = {
                user_id: userId,
                course_id: courseId,
                enrollment_status: 'not_started',
                enrolled_at: new Date(),
                progress_percentage: 0
            };

            const createdEnrollment = await this.enrollmentRepo.create(enrollment);
            return createdEnrollment as CourseEnrollmentResult;
        } catch (error) {
            throw new Error(`Failed to enroll user in course: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get user's enrollment status for a course
     */
    async getUserEnrollment(userId: string, courseId: string): Promise<CourseEnrollmentResult | null> {
        try {
            const enrollment = await this.enrollmentRepo.findByUserAndCourse(userId, courseId);
            return enrollment as CourseEnrollmentResult | null;
        } catch (error) {
            throw new Error(`Failed to get user enrollment: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Rate a course
     */
    async rateCourse(userId: string, courseId: string, rating: number, review?: string): Promise<CourseRatingResult> {
        try {
            // Validate rating
            if (rating < 1 || rating > 5) {
                throw new Error('Rating must be between 1 and 5');
            }

            // Check if user is enrolled
            const enrollment = await this.enrollmentRepo.findByUserAndCourse(userId, courseId);
            if (!enrollment) {
                throw new Error('User must be enrolled in the course to rate it');
            }

            // Check if user already rated this course
            const existingRating = await this.ratingRepo.findByUserAndCourse(userId, courseId);
            
            if (existingRating) {
                const updatedRating = await this.ratingRepo.update(existingRating.rating_id, {
                    rating_value: rating,
                    review_text: review
                });
                return updatedRating as CourseRatingResult;
            }

            // Create new rating
            const newRating: NewCourseRating = {
                course_id: courseId,
                user_id: userId,
                rating_value: rating,
                review_text: review
            };

            const createdRating = await this.ratingRepo.create(newRating);
            return createdRating as CourseRatingResult;
        } catch (error) {
            throw new Error(`Failed to rate course: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get course ratings and reviews
     */
    async getCourseRatings(courseId: string, page: number = 1, limit: number = 10): Promise<CourseRatingsResponse> {
        try {
            const offset = (page - 1) * limit;
            const result = await this.ratingRepo.findByCourse(courseId, limit, offset);
            return result as unknown as CourseRatingsResponse;
        } catch (error) {
            throw new Error(`Failed to get course ratings: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Complete a course and generate certificate
     */
    async completeCourse(userId: string, courseId: string): Promise<CourseCompletionResult> {
        try {
            const enrollment = await this.enrollmentRepo.findByUserAndCourse(userId, courseId);
            
            if (!enrollment) {
                throw new Error('User is not enrolled in this course');
            }

            // Update enrollment status
            const updatedEnrollment = await this.enrollmentRepo.update(enrollment.enrollment_id, {
                enrollment_status: 'completed',
                completed_at: new Date(),
                progress_percentage: 100
            });

            // Generate certificate
            const certificate: NewCourseCertificate = {
                enrollment_id: enrollment.enrollment_id,
                certificate_code: this.generateCertificateCode(),
                issued_at: new Date()
            };

            const createdCertificate = await this.certificateRepo.create(certificate);

            return {
                enrollment: updatedEnrollment,
                certificate: createdCertificate
            } as CourseCompletionResult;
        } catch (error) {
            throw new Error(`Failed to complete course: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Get user's course progress
     */
    async getUserCourseProgress(userId: string, courseId: string): Promise<CourseProgress> {
        try {
            const enrollment = await this.enrollmentRepo.findByUserAndCourse(userId, courseId);
            
            if (!enrollment) {
                return { 
                    enrollment_id: '', 
                    progress_percentage: 0, 
                    status: 'not_enrolled', 
                    total_lessons: 0, 
                    completed_lessons: 0 
                };
            }

            // Get lessons for this course
            const courseLessons = await db.select().from(lessons).where(eq(lessons.course_id, courseId));

            // Get lesson progress for this user
            const lessonProgress = await db.select().from(lesson_progress)
                .where(eq(lesson_progress.enrollment_id, enrollment.enrollment_id));

            const totalLessons = courseLessons.length;
            const completedLessons = lessonProgress.filter(lp => lp.status === 'completed').length;
            
            const progress = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

            return {
                enrollment_id: enrollment.enrollment_id,
                progress_percentage: progress,
                status: enrollment.enrollment_status ?? 'not_started',
                total_lessons: totalLessons,
                completed_lessons: completedLessons
            };
        } catch (error) {
            throw new Error(`Failed to get user course progress: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    private generateCertificateCode(): string {
        return 'CERT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
}

export const courseService = new CourseService();
