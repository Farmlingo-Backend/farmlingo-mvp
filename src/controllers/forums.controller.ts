import { Request, Response, NextFunction } from 'express';

import { forumService } from '../services/forums.service';
import { NewForum, NewForumPost } from '../db/schema';

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

function toBoolean(value: unknown): boolean | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;
  }
  return undefined;
}

export const getForums = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1);

    const result = await forumService.getForums(page, limit);

    res.status(200).json(result);
  } catch (err) {
    next(err as Error);
  }
};

export const createForum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const body = req.body as Partial<NewForum>;

    if (!body.name || !body.slug) {
      return next(createHttpError(400, "Name and Slug are required"));
    }

    const created = await forumService.createForum({
      name: body.name,
      description: body.description,
      slug: body.slug,
      category: body.category,
      is_active: toBoolean((body as any).is_active),
      display_order: toNumber((body as any).display_order),
    } as NewForum);

    res.status(201).json(created);
  } catch (err) {
    next(err as Error);
  }
};

export const getForumById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { forumId } = req.params as { forumId: string };
    const forum = await forumService.getForumById(forumId);

    if (!forum) return next(createHttpError(404, 'Forum not found'));

    res.status(200).json(forum);
  } catch (err) {
    next(err as Error);
  }
};

export const updateForum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { forumId } = req.params as { forumId: string };
    const body = req.body as Partial<NewForum>;

    const updated = await forumService.updateForum(forumId, {
      name: body.name,
      description: body.description,
      slug: (body as any).slug,
      category: body.category,
      is_active: toBoolean((body as any).is_active),
      display_order: toNumber((body as any).display_order),
    });

    if (!updated) return next(createHttpError(404, 'Forum not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err as Error);
  }
};

export const deleteForum = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { forumId } = req.params as { forumId: string };
    const deleted = await forumService.deleteForum(forumId);

    if (!deleted) return next(createHttpError(404, 'Forum not found'));

    res.status(204).send();
  } catch (err) {
    next(err as Error);
  }
};

export const getForumPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { forumId } = req.params as { forumId: string };
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1);

    const result = await forumService.getForumPosts(forumId, page, limit);

    res.status(200).json(result);
  } catch (err) {
    next(err as Error);
  }
};

export const createForumPost = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { forumId } = req.params as { forumId: string };
    const body = req.body as Partial<NewForumPost & { tags?: unknown }>;

    let tags: unknown = body.tags;
    if (typeof tags === 'string') {
      try { tags = tags ? JSON.parse(tags) : undefined; } catch { return next(createHttpError(400, 'Invalid tags JSON')); }
    }

    const created = await forumService.createForumPost({
      forum_id: forumId,
      user_id: (req as any).auth.userId,
      title: (body as any).title,
      content: (body as any).content,
      tags: tags as NewForumPost['tags'],
    } as NewForumPost);

    res.status(201).json(created);
  } catch (err) {
    next(err as Error);
  }
};
