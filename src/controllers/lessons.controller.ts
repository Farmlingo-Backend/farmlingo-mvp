import { Request, Response, NextFunction } from 'express';
import { lessonService } from '../services/lessons.service';
import { NewLesson } from '../db/schema';

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

export const getLessons = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1);
    const courseId = (req.query.courseId as string | undefined) || undefined;

    const result = await lessonService.getLessons(page, limit, courseId);

    res.status(200).json(result);
  } catch (err) {
    next(err as Error);
  }
};

export const createLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as Partial<NewLesson & { metadata?: unknown }>;

    let metadata: unknown = body.metadata;
    if (typeof metadata === 'string') {
      try { metadata = metadata ? JSON.parse(metadata) : undefined; } catch { return next(createHttpError(400, 'Invalid metadata JSON')); }
    }

    if (!body.course_id || !body.title) {
      return next(createHttpError(400, "Course ID and Title are required"));
    }

    const created = await lessonService.createLesson({
      course_id: body.course_id,
      title: body.title,
      description: body.description,
      category: body.category,
      duration_minutes: toNumber(body.duration_minutes),
      order_number: toNumber(body.order_number),
      is_mandatory: body.is_mandatory as boolean | undefined,
      metadata: metadata as NewLesson['metadata'],
      status: body.status,
      creator_id: body.creator_id,
    } as NewLesson);

    res.status(201).json(created);
  } catch (err) {
    next(err as Error);
  }
};

export const getLessonById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    const lesson = await lessonService.getLessonById(lessonId);

    if (!lesson) return next(createHttpError(404, 'Lesson not found'));

    res.status(200).json(lesson);
  } catch (err) {
    next(err as Error);
  }
};

export const updateLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    const body = req.body as Partial<NewLesson & { metadata?: unknown }>;

    let metadata: unknown = body.metadata;
    if (typeof metadata === 'string') {
      try { metadata = metadata ? JSON.parse(metadata) : undefined; } catch { return next(createHttpError(400, 'Invalid metadata JSON')); }
    }

    const updated = await lessonService.updateLesson(lessonId, {
      title: body.title,
      description: body.description,
      category: body.category,
      duration_minutes: toNumber(body.duration_minutes),
      order_number: toNumber(body.order_number),
      is_mandatory: body.is_mandatory as boolean | undefined,
      metadata: metadata as NewLesson['metadata'],
      status: body.status,
    });

    if (!updated) return next(createHttpError(404, 'Lesson not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err as Error);
  }
};

export const deleteLesson = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };
    const deleted = await lessonService.deleteLesson(lessonId);

    if (!deleted) return next(createHttpError(404, 'Lesson not found'));

    res.status(204).send();
  } catch (err) {
    next(err as Error);
  }
};

// Admin endpoints for managing lessons
export const getAllLessonsAdmin = async (
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
    const courseId = (req.query.courseId as string | undefined) || undefined;

    const result = await lessonService.getLessons(page, limit, courseId);

    res.status(200).json(result);
  } catch (err) {
    next(err as Error);
  }
};
