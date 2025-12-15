import { CourseRepository } from '../repositories/courses.repository';
import { NewCourse, Course } from '../db/schema';

export class CourseService {
    private courseRepo: CourseRepository;

    constructor() {
        this.courseRepo = new CourseRepository();
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
}

export const courseService = new CourseService();
