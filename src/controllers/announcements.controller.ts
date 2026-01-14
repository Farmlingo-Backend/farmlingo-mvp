import { Request, Response, NextFunction } from 'express';
import { announcementService } from '../services/announcements.service';
import { NewAnnouncement } from '../db/schema';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

// Helper function to check if user is admin
const isAdmin = (req: Request): boolean => {
  const auth = req.auth || (req as any).auth;
  return auth && (auth.role === 'admin' || auth.role === 'super_admin');
};

// Helper function to get current user ID
const getCurrentUserId = (req: Request): string | null => {
  const auth = req.auth || (req as any).auth;
  return auth?.userId || null;
};

export const getAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1);
    const activeOnly = req.query.activeOnly !== 'false'; // Default to true

    const result = await announcementService.getAnnouncements(page, limit, activeOnly);

    res.status(200).json(result);
  } catch (err) {
    next(err as Error);
  }
};

export const getAnnouncementById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { announcementId } = req.params as { announcementId: string };
    const announcement = await announcementService.getAnnouncementById(announcementId);

    res.status(200).json(announcement);
  } catch (err) {
    next(err as Error);
  }
};

export const createAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as Partial<NewAnnouncement>;
    const userId = getCurrentUserId(req);

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    // Only admins can create announcements
    if (!isAdmin(req)) {
      return next(createHttpError(403, 'Forbidden: Only admins can create announcements'));
    }

    // Basic validation
    if (!body.title) {
      return next(createHttpError(400, "Title is required"));
    }

    if (!body.content) {
      return next(createHttpError(400, "Content is required"));
    }

    const created = await announcementService.createAnnouncement({
      title: body.title,
      content: body.content,
      created_by: userId,
      is_active: body.is_active ?? true,
    } as NewAnnouncement);

    res.status(201).json(created);
  } catch (err) {
    next(err as Error);
  }
};

export const updateAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { announcementId } = req.params as { announcementId: string };
    const body = req.body as Partial<NewAnnouncement>;
    const userId = getCurrentUserId(req);

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    const updated = await announcementService.updateAnnouncement(
      announcementId,
      {
        title: body.title,
        content: body.content,
        is_active: body.is_active,
      },
      userId,
      isAdmin(req)
    );

    res.status(200).json(updated);
  } catch (err) {
    next(err as Error);
  }
};

export const deleteAnnouncement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { announcementId } = req.params as { announcementId: string };
    const userId = getCurrentUserId(req);

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    const deleted = await announcementService.deleteAnnouncement(
      announcementId,
      userId,
      isAdmin(req)
    );

    res.status(200).json(deleted);
  } catch (err) {
    next(err as Error);
  }
};

// Admin endpoints for managing announcements
export const getAllAnnouncements = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!isAdmin(req)) {
      return next(createHttpError(403, 'Forbidden: Admin access required'));
    }

    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '50'), 10) || 50, 1);
    const activeOnly = req.query.activeOnly === 'false' ? false : true;

    const result = await announcementService.getAnnouncements(page, limit, activeOnly);

    res.status(200).json(result);
  } catch (err) {
    next(err as Error);
  }
};

export const getAnnouncementsByCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { creatorId } = req.params as { creatorId: string };
    const currentUserId = getCurrentUserId(req);

    if (!currentUserId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    // Only admin or the creator can view announcements by creator
    if (!isAdmin(req) && currentUserId !== creatorId) {
      return next(createHttpError(403, 'Forbidden: You can only view your own announcements'));
    }

    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1);

    const result = await announcementService.getAnnouncementsByCreator(creatorId, page, limit);

    res.status(200).json(result);
  } catch (err) {
    next(err as Error);
  }
};
