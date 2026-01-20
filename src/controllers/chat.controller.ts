import { Request, Response, NextFunction } from 'express';
import { eq, sql, desc } from 'drizzle-orm';

import { db } from '../db/dbconfig';
import {
  chatrooms,
  chat_messages,
  message_reactions,
  chatroom_members,
  chatroomInvitationsTable as chatroom_invitations,
  membershipRequestsTable as membership_requests,
  NewChatroom,
  NewChatMessage,
  NewChatroomMember
} from '../db/schema';

interface HttpError extends Error { status?: number }
const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

export const getChatrooms = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) ?? 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '10'), 10) ?? 10, 1);
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
    const userId = req.auth?.userId;
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
        avatar_url: body.avatar_url,
        created_by: userId,
        settings: settings,
      })
      .returning();

    // Add creator as admin member
    if (!userId) {
      throw createHttpError(401, 'User ID is required');
    }

    await db.insert(chatroom_members).values({
      chatroom_id: created.chatroom_id,
      user_id: userId,
      role: 'admin',
      status: 'active',
      invited_by: userId,
    } as NewChatroomMember);

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
        avatar_url: body.avatar_url,
        settings: settings,
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
    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) ?? 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '50'), 10) ?? 50, 1);
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
    const userId = req.auth?.userId;
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
        reply_to_message_id: body.reply_to_message_id,
        content: body.content,
        message_type: body.message_type,
        metadata: metadata,
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

    if (!auth?.role) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (auth.role !== 'admin' && auth.role !== 'super_admin') {
      return next(createHttpError(403, 'Forbidden: Admin access required'));
    }

    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) ?? 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '50'), 10) ?? 50, 1);
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
    const userId = req.auth?.userId;

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (!content?.trim()) {
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
    const userId = req.auth?.userId;

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
    const isAdmin = auth?.role && (auth.role === 'admin' || auth.role === 'super_admin');

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
    const userId = req.auth?.userId;

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

export const getMessageReactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messageId } = req.params as { messageId: string };

    // Get all reactions for the message
    const reactions = await db
      .select()
      .from(message_reactions)
      .where(eq(message_reactions.message_id, messageId));

    res.status(200).json({
      data: reactions,
      count: reactions.length
    });
  } catch (err) {
    next(err as Error);
  }
};

export const removeMessageReaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { messageId } = req.params as { messageId: string };
    const { emoji } = req.query as { emoji: string };
    const userId = req.auth?.userId;

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (!emoji) {
      return next(createHttpError(400, 'Emoji parameter is required'));
    }

    // Remove the specific reaction
    const result = await db
      .delete(message_reactions)
      .where(sql`${message_reactions.message_id} = ${messageId} AND ${message_reactions.user_id} = ${userId} AND ${message_reactions.emoji} = ${emoji}`)
      .returning();

    if (result.length === 0) {
      return next(createHttpError(404, 'Reaction not found'));
    }

    res.status(200).json({ message: 'Reaction removed successfully' });
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
    const userId = req.auth?.userId;

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
    const userId = req.auth?.userId;

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
export const clearChatHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params;
    const userId = req.auth?.userId;

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    // Verify user is member of the chatroom
    const membership = await db.select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${userId} AND ${chatroom_members.status} = 'active'`)
      .limit(1);

    if (membership.length === 0) {
      return next(createHttpError(403, 'You are not a member of this chatroom'));
    }

    // Verify this is a direct chat (private conversation)
    const [chat] = await db.select()
      .from(chatrooms)
      .where(eq(chatrooms.chatroom_id, chatroomId))
      .limit(1);

    if (chat?.chatroom_type !== 'direct') {
      return next(createHttpError(400, 'Chat history can only be cleared for private conversations'));
    }

    // Soft delete all messages in the chat
    await db.update(chat_messages)
      .set({
        is_deleted: true,
        deleted_reason: 'Chat history cleared',
        deleted_at: new Date()
      })
      .where(eq(chat_messages.chatroom_id, chatroomId));

    res.status(200).json({ message: 'Chat history cleared successfully' });
  } catch (err) {
    next(err as Error);
  }
};

export const getAllChatMessagesAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = req.auth;

    if (!auth?.role) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (auth.role !== 'admin' && auth.role !== 'super_admin') {
      return next(createHttpError(403, 'Forbidden: Admin access required'));
    }

    const page = Math.max(parseInt(String(req.query.page ?? '1'), 10) ?? 1, 1);
    const limit = Math.max(parseInt(String(req.query.limit ?? '100'), 10) ?? 100, 1);
    const offset = (page - 1) * limit;

    const rows = await db.select().from(chat_messages).limit(limit).offset(offset);

    res.status(200).json({ data: rows, pagination: { page, limit } });
  } catch (err) {
    next(err as Error);
  }
};

// Member management endpoints
export const addChatroomMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params as { chatroomId: string };
    const { user_id, role = 'member' } = req.body;
    const currentUserId = req.auth?.userId;

    if (!currentUserId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (!user_id) {
      return next(createHttpError(400, 'user_id is required'));
    }

    // Check if current user is admin of the chatroom
    const membership = await db
      .select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${currentUserId} AND ${chatroom_members.role} = 'admin' AND ${chatroom_members.status} = 'active'`)
      .limit(1);

    if (membership.length === 0) {
      return next(createHttpError(403, 'You must be an admin of this chatroom to add members'));
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${user_id}`)
      .limit(1);

    if (existingMember.length > 0) {
      return next(createHttpError(400, 'User is already a member of this chatroom'));
    }

    // Add member
    const [addedMember] = await db
      .insert(chatroom_members)
      .values({
        chatroom_id: chatroomId,
        user_id: user_id,
        role: role,
        status: 'active',
        invited_by: currentUserId,
      })
      .returning();

    // Update member count
    await db
      .update(chatrooms)
      .set({ member_count: sql`${chatrooms.member_count} + 1` })
      .where(eq(chatrooms.chatroom_id, chatroomId));

    res.status(201).json(addedMember);
  } catch (err) {
    next(err as Error);
  }
};

export const getChatroomMembers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params as { chatroomId: string };

    const members = await db
      .select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.status} = 'active'`);

    res.status(200).json({ data: members });
  } catch (err) {
    next(err as Error);
  }
};

export const inviteMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params as { chatroomId: string };
    const { user_id, email, message } = req.body;
    const currentUserId = req.auth?.userId;

    if (!currentUserId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (!user_id && !email) {
      return next(createHttpError(400, 'Either user_id or email is required'));
    }

    // Check if current user is admin of the chatroom
    const membership = await db
      .select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${currentUserId} AND ${chatroom_members.role} = 'admin' AND ${chatroom_members.status} = 'active'`)
      .limit(1);

    if (membership.length === 0) {
      return next(createHttpError(403, 'You must be an admin of this chatroom to invite members'));
    }

    // Check if already invited
    if (user_id) {
      const existingInvite = await db
        .select()
        .from(chatroom_invitations)
        .where(sql`${chatroom_invitations.chatroom_id} = ${chatroomId} AND ${chatroom_invitations.invited_user_id} = ${user_id} AND ${chatroom_invitations.status} = 'pending'`)
        .limit(1);

      if (existingInvite.length > 0) {
        return next(createHttpError(400, 'User already has a pending invitation'));
      }

      // Check if already member
      const existingMember = await db
        .select()
        .from(chatroom_members)
        .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${user_id} AND ${chatroom_members.status} = 'active'`)
        .limit(1);

      if (existingMember.length > 0) {
        return next(createHttpError(400, 'User is already a member'));
      }
    } else if (email) {
      const existingInvite = await db
        .select()
        .from(chatroom_invitations)
        .where(sql`${chatroom_invitations.chatroom_id} = ${chatroomId} AND ${chatroom_invitations.invited_email} = ${email} AND ${chatroom_invitations.status} = 'pending'`)
        .limit(1);

      if (existingInvite.length > 0) {
        return next(createHttpError(400, 'Email already has a pending invitation'));
      }
    }

    // Generate invitation code
    const invitationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const [invitation] = await db
      .insert(chatroom_invitations)
      .values({
        chatroom_id: chatroomId,
        invited_user_id: user_id ?? null,
        invited_email: email ?? null,
        invitation_code: invitationCode,
        invited_by: currentUserId,
        message: message ?? null,
      })
      .returning();

    res.status(201).json(invitation);
  } catch (err) {
    next(err as Error);
  }
};

export const requestJoin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId } = req.params as { chatroomId: string };
    const { message } = req.body;
    const userId = req.auth?.userId;

    if (!userId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    // Check if chatroom exists and requires approval
    const [chatroom] = await db
      .select()
      .from(chatrooms)
      .where(eq(chatrooms.chatroom_id, chatroomId))
      .limit(1);

    if (!chatroom) {
      return next(createHttpError(404, 'Chatroom not found'));
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${userId}`)
      .limit(1);

    if (existingMember.length > 0) {
      if (existingMember[0].status === 'active') {
        return next(createHttpError(400, 'You are already a member of this chatroom'));
      } else if (existingMember[0].status === 'banned') {
        return next(createHttpError(403, 'You are banned from this chatroom'));
      }
    }

    // Check if there's already a pending request
    const existingRequest = await db
      .select()
      .from(membership_requests)
      .where(sql`${membership_requests.chatroom_id} = ${chatroomId} AND ${membership_requests.user_id} = ${userId} AND ${membership_requests.status} = 'pending'`)
      .limit(1);

    if (existingRequest.length > 0) {
      return next(createHttpError(400, 'You already have a pending join request'));
    }

    // Create join request
    const [request] = await db
      .insert(membership_requests)
      .values({
        chatroom_id: chatroomId,
        user_id: userId,
        message: message ?? null,
        status: 'pending',
      })
      .returning();

    res.status(201).json(request);
  } catch (err) {
    next(err as Error);
  }
};

export const approveJoinRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId, requestId } = req.params as { chatroomId: string; requestId: string };
    const currentUserId = req.auth?.userId;

    if (!currentUserId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    // Check if current user is admin of the chatroom
    const membership = await db
      .select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${currentUserId} AND ${chatroom_members.role} = 'admin' AND ${chatroom_members.status} = 'active'`)
      .limit(1);

    if (membership.length === 0) {
      return next(createHttpError(403, 'You must be an admin of this chatroom to approve requests'));
    }

    // Get the request
    const [request] = await db
      .select()
      .from(membership_requests)
      .where(sql`${membership_requests.request_id} = ${requestId} AND ${membership_requests.chatroom_id} = ${chatroomId} AND ${membership_requests.status} = 'pending'`)
      .limit(1);

    if (!request) {
      return next(createHttpError(404, 'Join request not found'));
    }

    // Check if user is already a member
    const existingMember = await db
      .select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${request.user_id}`)
      .limit(1);

    if (existingMember.length > 0) {
      // If banned, can't approve
      if (existingMember[0].status === 'banned') {
        return next(createHttpError(400, 'User is banned from this chatroom'));
      }
      // If already active, just update request
      await db
        .update(membership_requests)
        .set({
          status: 'approved',
          reviewed_by: currentUserId,
          reviewed_at: new Date()
        })
        .where(eq(membership_requests.request_id, requestId));

      res.status(200).json({ message: 'User is already a member, request approved' });
      return;
    }

    // Add user as member
    await db.insert(chatroom_members).values({
      chatroom_id: chatroomId,
      user_id: request.user_id,
      role: 'member',
      status: 'active',
      invited_by: currentUserId,
    });

    // Update member count
    await db
      .update(chatrooms)
      .set({ member_count: sql`${chatrooms.member_count} + 1` })
      .where(eq(chatrooms.chatroom_id, chatroomId));

    // Update request
    await db
      .update(membership_requests)
      .set({
        status: 'approved',
        reviewed_by: currentUserId,
        reviewed_at: new Date()
      })
      .where(eq(membership_requests.request_id, requestId));

    res.status(200).json({ message: 'Join request approved' });
  } catch (err) {
    next(err as Error);
  }
};

export const rejectJoinRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId, requestId } = req.params as { chatroomId: string; requestId: string };
    const { reason } = req.body;
    const currentUserId = req.auth?.userId;

    if (!currentUserId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    // Check if current user is admin of the chatroom
    const membership = await db
      .select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${currentUserId} AND ${chatroom_members.role} = 'admin' AND ${chatroom_members.status} = 'active'`)
      .limit(1);

    if (membership.length === 0) {
      return next(createHttpError(403, 'You must be an admin of this chatroom to reject requests'));
    }

    // Update request
    const [updated] = await db
      .update(membership_requests)
      .set({
        status: 'rejected',
        reviewed_by: currentUserId,
        reviewed_at: new Date(),
        response_message: reason ?? null
      })
      .where(sql`${membership_requests.request_id} = ${requestId} AND ${membership_requests.chatroom_id} = ${chatroomId} AND ${membership_requests.status} = 'pending'`)
      .returning();

    if (!updated) {
      return next(createHttpError(404, 'Join request not found'));
    }

    res.status(200).json({ message: 'Join request rejected' });
  } catch (err) {
    next(err as Error);
  }
};

export const removeChatroomMember = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId, userId } = req.params as { chatroomId: string; userId: string };
    const currentUserId = req.auth?.userId;

    if (!currentUserId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    // Check if current user is admin of the chatroom
    const membership = await db
      .select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${currentUserId} AND ${chatroom_members.role} = 'admin' AND ${chatroom_members.status} = 'active'`)
      .limit(1);

    if (membership.length === 0) {
      return next(createHttpError(403, 'You must be an admin of this chatroom to remove members'));
    }

    // Can't remove yourself
    if (userId === currentUserId) {
      return next(createHttpError(400, 'You cannot remove yourself from the chatroom'));
    }

    // Update member status
    const [removed] = await db
      .update(chatroom_members)
      .set({
        status: 'removed',
        left_at: new Date()
      })
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${userId} AND ${chatroom_members.status} = 'active'`)
      .returning();

    if (!removed) {
      return next(createHttpError(404, 'Member not found'));
    }

    // Update member count
    await db
      .update(chatrooms)
      .set({ member_count: sql`${chatrooms.member_count} - 1` })
      .where(eq(chatrooms.chatroom_id, chatroomId));

    res.status(200).json({ message: 'Member removed successfully' });
  } catch (err) {
    next(err as Error);
  }
};

export const changeMemberRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { chatroomId, userId } = req.params as { chatroomId: string; userId: string };
    const { role } = req.body;
    const currentUserId = req.auth?.userId;

    if (!currentUserId) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (!['admin', 'moderator', 'member'].includes(role)) {
      return next(createHttpError(400, 'Invalid role'));
    }

    // Check if current user is admin of the chatroom
    const membership = await db
      .select()
      .from(chatroom_members)
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${currentUserId} AND ${chatroom_members.role} = 'admin' AND ${chatroom_members.status} = 'active'`)
      .limit(1);

    if (membership.length === 0) {
      return next(createHttpError(403, 'You must be an admin of this chatroom to change roles'));
    }

    // Can't change your own role
    if (userId === currentUserId) {
      return next(createHttpError(400, 'You cannot change your own role'));
    }

    // Update member role
    const [updated] = await db
      .update(chatroom_members)
      .set({ role: role })
      .where(sql`${chatroom_members.chatroom_id} = ${chatroomId} AND ${chatroom_members.user_id} = ${userId} AND ${chatroom_members.status} = 'active'`)
      .returning();

    if (!updated) {
      return next(createHttpError(404, 'Member not found'));
    }

    res.status(200).json({ message: 'Member role updated successfully' });
  } catch (err) {
    next(err as Error);
  }
};
