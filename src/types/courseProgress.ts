import { CourseEnrollment, CourseRating, CourseCertificate } from '../db/schema';

export interface CourseProgress {
    enrollment_id: string;
    progress_percentage: number;
    status: string;
    total_lessons: number;
    completed_lessons: number;
}

export interface CourseCompletionResult {
    enrollment: CourseEnrollment;
    certificate: CourseCertificate;
}

export interface CourseRatingResult {
    course_id: string;
    user_id: string;
    rating_value: number;
    review_text?: string;
}

export interface CourseEnrollmentResult {
    enrollment_id: string | null;
    user_id: string;
    course_id: string;
    enrollment_status: string;
    enrolled_at: Date;
    progress_percentage: number;
    completed_at?: Date;
}

export interface CourseRatingsResponse {
    ratings: CourseRating[];
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
}
