import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';

import { db } from '../db/dbconfig';
import { chatrooms, chat_messages, NewChatroom, NewChatMessage } from '../db/schema';

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

export const getChatrooms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) || 10, 1);
    const offset = (page - 1) * limit;

    const rows = await db.select().from(chatrooms).limit(limit).offset(offset);

    res.status(200).json({ data: rows, pagination: { page, limit } });
  } catch (err) {
    next(err as Error);
  }
};

export const createChatroom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).auth.userId;
    const body = req.body as Partial<NewChatroom & { settings?: unknown }>;

    let settings: unknown = body.settings;
    if (typeof settings === 'string') {
      try { settings = settings ? JSON.parse(settings) : undefined; } catch { return next(createHttpError(400, 'Invalid settings JSON')); }
    }

    const [created] = await db
      .insert(chatrooms)
      .values({
        chatroom_type: body.chatroom_type!,
        name: body.name,
        description: body.description,
        avatar_url: (body as any).avatar_url,
        created_by: userId,
        settings: settings as NewChatroom['settings'],
      } as NewChatroom)
      .returning();

    res.status(201).json(created);
  } catch (err) {
    next(err as Error);
  }
};

export const getChatroomById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params as { chatroomId: string };
    const rows = await db.select().from(chatrooms).where(eq(chatrooms.chatroom_id, chatroomId)).limit(1);
    const room = rows[0];
    if (!room) return next(createHttpError(404, 'Chat room not found'));
    res.status(200).json(room);
  } catch (err) {
    next(err as Error);
  }
};

export const updateChatroom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params as { chatroomId: string };
    const body = req.body as Partial<NewChatroom & { settings?: unknown }>;

    let settings: unknown = body.settings;
    if (typeof settings === 'string') {
      try { settings = settings ? JSON.parse(settings) : undefined; } catch { return next(createHttpError(400, 'Invalid settings JSON')); }
    }

    const [updated] = await db
      .update(chatrooms)
      .set({
        chatroom_type: body.chatroom_type,
        name: body.name,
        description: body.description,
        avatar_url: (body as any).avatar_url,
        settings: settings as NewChatroom['settings'],
      })
      .where(eq(chatrooms.chatroom_id, chatroomId))
      .returning();

    if (!updated) return next(createHttpError(404, 'Chat room not found'));
    res.status(200).json(updated);
  } catch (err) {
    next(err as Error);
  }
};

export const deleteChatroom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params as { chatroomId: string };
    const result = await db.delete(chatrooms).where(eq(chatrooms.chatroom_id, chatroomId)).returning();
    if (result.length === 0) return next(createHttpError(404, 'Chat room not found'));
    res.status(204).send();
  } catch (err) {
    next(err as Error);
  }
};

export const getChatMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params as { chatroomId: string };
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) || 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '50'), 10) || 50, 1);
    const offset = (page - 1) * limit;

    const rows = await db
      .select()
      .from(chat_messages)
      .where(eq(chat_messages.chatroom_id, chatroomId))
      .limit(limit)
      .offset(offset);

    res.status(200).json({ data: rows, pagination: { page, limit } });
  } catch (err) {
    next(err as Error);
  }
};

export const createChatMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).auth.userId;
    const { chatroomId } = req.params as { chatroomId: string };
    const body = req.body as Partial<NewChatMessage & { metadata?: unknown }>;

    let metadata: unknown = body.metadata;
    if (typeof metadata === 'string') {
      try { metadata = metadata ? JSON.parse(metadata) : undefined; } catch { return next(createHttpError(400, 'Invalid metadata JSON')); }
    }

    const [created] = await db
      .insert(chat_messages)
      .values({
        chatroom_id: chatroomId,
        user_id: userId,
        reply_to_message_id: (body as any).reply_to_message_id,
        content: (body as any).content,
        message_type: (body as any).message_type,
        metadata: metadata as NewChatMessage['metadata'],
      } as NewChatMessage)
      .returning();

    res.status(201).json(created);
  } catch (err) {
    next(err as Error);
  }
};
