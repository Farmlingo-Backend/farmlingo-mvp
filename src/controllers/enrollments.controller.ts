import { Request, Response, NextFunction } from 'express';
import { enrollmentService } from '../services/enrollments.service';
import { NewCourseEnrollment } from '../db/schema';

interface HttpError extends Error { status?: number }
const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

function toNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const n = typeof value === 'string' ? Number(value) : (value as number);
  return Number.isFinite(n) ? n : undefined;
}

export const getEnrollments = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1);

    const userId = (req.query.userId as string | undefined) || undefined;
    const courseId = (req.query.courseId as string | undefined) || undefined;

    const result = await enrollmentService.getEnrollments(page, limit, userId, courseId);

    res.status(200).json(result);
  } catch (err) {
    next(err as Error);
  }
};

export const createEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as Partial<NewCourseEnrollment & { preferences?: unknown }>;

    let preferences: unknown = body.preferences;
    if (typeof preferences === 'string') {
      try { preferences = preferences ? JSON.parse(preferences) : undefined; } catch { return next(createHttpError(400, 'Invalid preferences JSON')); }
    }

    if (!body.course_id) {
      return next(createHttpError(400, "Course ID is required"));
    }

    const created = await enrollmentService.createEnrollment({
      user_id: (req as any).auth.userId,
      course_id: body.course_id,
      enrollment_status: body.enrollment_status,
      preferences: preferences as NewCourseEnrollment['preferences'],
    } as NewCourseEnrollment);

    res.status(201).json(created);
  } catch (err) {
    next(err as Error);
  }
};

export const getEnrollmentById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { enrollmentId } = req.params as { enrollmentId: string };
    const enrollment = await enrollmentService.getEnrollmentById(enrollmentId);

    if (!enrollment) return next(createHttpError(404, 'Enrollment not found'));

    res.status(200).json(enrollment);
  } catch (err) {
    next(err as Error);
  }
};

export const updateEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { enrollmentId } = req.params as { enrollmentId: string };
    const { progress_percentage, status } = req.body as { progress_percentage?: unknown; status?: string };

    const updated = await enrollmentService.updateEnrollment(enrollmentId, {
      progress_percentage: toNumber(progress_percentage),
      enrollment_status: status as any,
    });

    if (!updated) return next(createHttpError(404, 'Enrollment not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err as Error);
  }
};

export const deleteEnrollment = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { enrollmentId } = req.params as { enrollmentId: string };
    const deleted = await enrollmentService.deleteEnrollment(enrollmentId);

    if (!deleted) return next(createHttpError(404, 'Enrollment not found'));

    res.status(204).send();
  } catch (err) {
    next(err as Error);
  }
};
