import { Request, Response, NextFunction } from 'express';
import { courseService } from '../services/courses.service';
import { NewCourse } from '../db/schema';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

export const getCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1);

    const result = await courseService.getCourses(page, limit);

    res.status(200).json(result);
  } catch (err) {
    next(err as Error);
  }
};

export const createCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as Partial<NewCourse>;

    // Basic validation could be moved to service or keep here as controller concern
    if (!body.title) {
      return next(createHttpError(400, "Title is required"));
    }

    const created = await courseService.createCourse({
      title: body.title,
      description: body.description,
      category: body.category,
      language: body.language,
      thumbnail_url: body.thumbnail_url,
      status: body.status,
      creator_id: body.creator_id,
    } as NewCourse);

    res.status(201).json(created);
  } catch (err) {
    next(err as Error);
  }
};

export const getCourseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params as { courseId: string };
    const course = await courseService.getCourseById(courseId);

    if (!course) return next(createHttpError(404, 'Course not found'));

    res.status(200).json(course);
  } catch (err) {
    next(err as Error);
  }
};

export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params as { courseId: string };
    const body = req.body as Partial<NewCourse>;

    const updated = await courseService.updateCourse(courseId, {
      title: body.title,
      description: body.description,
      category: body.category,
      language: body.language,
      thumbnail_url: body.thumbnail_url,
      status: body.status,
    });

    if (!updated) return next(createHttpError(404, 'Course not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err as Error);
  }
};

export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params as { courseId: string };
    const deleted = await courseService.deleteCourse(courseId);

    if (!deleted) return next(createHttpError(404, 'Course not found'));

    res.status(204).send();
  } catch (err) {
    next(err as Error);
  }
};

// Admin endpoints for managing courses
export const getAllCoursesAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = req.auth;

    if (!auth) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (auth.role !== 'admin' && auth.role !== 'super_admin') {
      return next(createHttpError(403, 'Forbidden: Admin access required'));
    }

    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '50'), 10) || 50, 1);

    const result = await courseService.getCourses(page, limit);

    res.status(200).json(result);
  } catch (err) {
    next(err as Error);
  }
};
