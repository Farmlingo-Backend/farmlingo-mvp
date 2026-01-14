import { Request, Response, NextFunction } from 'express';
import { eq, sql, desc } from 'drizzle-orm';

import { db } from '../db/dbconfig';
import { chatrooms, chat_messages, message_reactions, NewChatroom, NewChatMessage } from '../db/schema';

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

// Admin endpoints for managing chatrooms
export const getAllChatroomsAdmin = async (
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
    const offset = (page - 1) * limit;

    const rows = await db.select().from(chatrooms).limit(limit).offset(offset);

    res.status(200).json({ data: rows, pagination: { page, limit } });
  } catch (err) {
    next(err as Error);
  }
};

// Message management endpoints
export const updateChatMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messageId } = req.params as { messageId: string };
    const { content } = req.body;
    const userId = (req as any).auth?.userId;

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (!content || !content.trim()) {
      return next(createHttpError(400, 'Message content is required'));
    }

    // Get existing message to check ownership
    const existingMessage = await db
      .select()
      .from(chat_messages)
      .where(eq(chat_messages.message_id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return next(createHttpError(404, 'Message not found'));
    }

    const message = existingMessage[0];

    // Check if user owns the message
    if (message.user_id !== userId) {
      return next(createHttpError(403, 'You can only edit your own messages'));
    }

    // Update message
    const [updatedMessage] = await db
      .update(chat_messages)
      .set({
        content: content.trim(),
        is_edited: true,
        updated_at: new Date()
      })
      .where(eq(chat_messages.message_id, messageId))
      .returning();

    res.status(200).json(updatedMessage);
  } catch (err) {
    next(err as Error);
  }
};

export const deleteChatMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messageId } = req.params as { messageId: string };
    const userId = (req as any).auth?.userId;

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    // Get existing message to check ownership
    const existingMessage = await db
      .select()
      .from(chat_messages)
      .where(eq(chat_messages.message_id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return next(createHttpError(404, 'Message not found'));
    }

    const message = existingMessage[0];

    // Check if user owns the message or is admin
    const auth = req.auth;
    const isAdmin = auth && (auth.role === 'admin' || auth.role === 'super_admin');

    if (message.user_id !== userId && !isAdmin) {
      return next(createHttpError(403, 'You can only delete your own messages'));
    }

    // Soft delete message
    const [deletedMessage] = await db
      .update(chat_messages)
      .set({
        is_deleted: true,
        deleted_reason: 'User deleted',
        deleted_at: new Date()
      })
      .where(eq(chat_messages.message_id, messageId))
      .returning();

    res.status(200).json(deletedMessage);
  } catch (err) {
    next(err as Error);
  }
};

export const addMessageReaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messageId } = req.params as { messageId: string };
    const { emoji } = req.body;
    const userId = (req as any).auth?.userId;

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (!emoji) {
      return next(createHttpError(400, 'Emoji is required'));
    }

    // Check if message exists
    const messageExists = await db
      .select({ message_id: chat_messages.message_id })
      .from(chat_messages)
      .where(eq(chat_messages.message_id, messageId))
      .limit(1);

    if (messageExists.length === 0) {
      return next(createHttpError(404, 'Message not found'));
    }

    // Add reaction
    const [reaction] = await db
      .insert(message_reactions)
      .values({
        message_id: messageId,
        user_id: userId,
        emoji: emoji
      })
      .returning();

    res.status(201).json(reaction);
  } catch (err) {
    next(err as Error);
  }
};

export const searchMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params as { chatroomId: string };
    const { q: searchQuery, limit = 50, offset = 0 } = req.query;
    const userId = (req as any).auth?.userId;

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (!searchQuery || typeof searchQuery !== 'string') {
      return next(createHttpError(400, 'Search query is required'));
    }

    // Search messages in the chatroom
    const messages = await db
      .select()
      .from(chat_messages)
      .where(sql`${chat_messages.chatroom_id} = ${chatroomId} AND ${chat_messages.content} ILIKE ${'%' + searchQuery + '%'} AND ${chat_messages.is_deleted} = false`)
      .orderBy(desc(chat_messages.created_at))
      .limit(Number(limit))
      .offset(Number(offset));

    res.status(200).json({
      messages,
      pagination: { limit: Number(limit), offset: Number(offset) }
    });
  } catch (err) {
    next(err as Error);
  }
};

export const getMessageHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params as { chatroomId: string };
    const { days = 30, limit = 100 } = req.query;
    const userId = (req as any).auth?.userId;

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    // Get messages from the last N days
    const messages = await db
      .select()
      .from(chat_messages)
      .where(sql`${chat_messages.chatroom_id} = ${chatroomId} AND ${chat_messages.created_at} >= NOW() - INTERVAL '${days} days' AND ${chat_messages.is_deleted} = false`)
      .orderBy(desc(chat_messages.created_at))
      .limit(Number(limit));

    res.status(200).json({
      messages,
      period: `${days} days`
    });
  } catch (err) {
    next(err as Error);
  }
};

// Admin endpoints for managing chat messages
export const getAllChatMessagesAdmin = async (
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
    const limit = Math.max(parseInt(String(req.query.limit ?? '100'), 10) || 100, 1);
    const offset = (page - 1) * limit;

    const rows = await db.select().from(chat_messages).limit(limit).offset(offset);

    res.status(200).json({ data: rows, pagination: { page, limit } });
  } catch (err) {
    next(err as Error);
  }
};
