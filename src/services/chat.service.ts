import { db } from '../db/dbconfig';
import { chatrooms, chatroom_members, chat_messages, message_reactions, NewChatroom, NewChatMessage } from '../db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { ChatType, ChatMemberRole, ChatMemberStatus, MessageType, ChatRoom, ChatMessage, ChatParticipant } from '../types/chat.types';

export class ChatService {
    /**
     * Create a new chat (unified for all types)
     */
    async createChat(
        type: ChatType,
        participants: string[],
        name?: string,
        description?: string,
        settings?: Record<string, any>
    ): Promise<ChatRoom> {
        const creatorId = participants[0]; // First participant is creator

        // Create chatroom
        const [chat] = await db.insert(chatrooms).values({
            chatroom_type: type,
            name: type === ChatType.DIRECT ? null : name,
            description,
            created_by: creatorId,
            settings
        }).returning();

        // Add participants
        for (const participantId of participants) {
            await db.insert(chatroom_members).values({
                chatroom_id: chat.chatroom_id,
                user_id: participantId,
                role: participantId === creatorId ? ChatMemberRole.ADMIN : ChatMemberRole.MEMBER,
                joined_at: new Date(),
                status: ChatMemberStatus.ACTIVE
            });
        }

        return this.formatChatRoom(chat, participants);
    }

    /**
     * Get chat by ID
     */
    async getChatById(chatId: string, userId: string): Promise<ChatRoom | null> {
        // Check if user is a member
        const membership = await db.select()
            .from(chatroom_members)
            .where(and(
                eq(chatroom_members.chatroom_id, chatId),
                eq(chatroom_members.user_id, userId),
                eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
            ))
            .limit(1);

        if (membership.length === 0) {
            return null;
        }

        const [chat] = await db.select().from(chatrooms).where(eq(chatrooms.chatroom_id, chatId));
        if (!chat) return null;

        const participants = await this.getChatParticipants(chatId);
        return this.formatChatRoom(chat, participants.map(p => p.userId));
    }

    /**
     * Get user's chats
     */
    async getUserChats(userId: string, type?: ChatType): Promise<ChatRoom[]> {
        const query = db.select({
            chatroom: chatrooms,
            member: chatroom_members
        })
        .from(chatrooms)
        .innerJoin(chatroom_members, eq(chatrooms.chatroom_id, chatroom_members.chatroom_id))
        .where(and(
            eq(chatroom_members.user_id, userId),
            eq(chatroom_members.status, ChatMemberStatus.ACTIVE),
            type ? eq(chatrooms.chatroom_type, type) : sql`true`
        ))
        .orderBy(desc(chatrooms.last_activity));

        const results = await query;

        const chatRooms: ChatRoom[] = [];
        for (const result of results) {
            const participants = await this.getChatParticipants(result.chatroom.chatroom_id);
            chatRooms.push(this.formatChatRoom(result.chatroom, participants.map(p => p.userId)));
        }

        return chatRooms;
    }

    /**
     * Send message to chat
     */
    async sendMessage(
        chatId: string,
        senderId: string,
        content: string,
        messageType: MessageType = MessageType.TEXT,
        replyToMessageId?: string,
        metadata?: Record<string, any>
    ): Promise<ChatMessage> {
        // Verify sender is member
        const membership = await db.select()
            .from(chatroom_members)
            .where(and(
                eq(chatroom_members.chatroom_id, chatId),
                eq(chatroom_members.user_id, senderId),
                eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
            ))
            .limit(1);

        if (membership.length === 0) {
            throw new Error('User is not a member of this chat');
        }

        // Create message
        const [message] = await db.insert(chat_messages).values({
            chatroom_id: chatId,
            user_id: senderId,
            content,
            message_type: messageType,
            reply_to_message_id: replyToMessageId,
            metadata
        }).returning();

        // Update chat last activity
        await db.update(chatrooms)
            .set({
                last_message_id: message.message_id,
                last_activity: new Date(),
                updated_at: new Date()
            })
            .where(eq(chatrooms.chatroom_id, chatId));

        return this.formatChatMessage(message);
    }

    /**
     * Get messages for a chat
     */
    async getChatMessages(
        chatId: string,
        userId: string,
        page: number = 1,
        limit: number = 50
    ): Promise<{ messages: ChatMessage[]; pagination: { page: number; limit: number; total: number } }> {
        // Verify user is member
        const membership = await db.select()
            .from(chatroom_members)
            .where(and(
                eq(chatroom_members.chatroom_id, chatId),
                eq(chatroom_members.user_id, userId),
                eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
            ))
            .limit(1);

        if (membership.length === 0) {
            throw new Error('User is not a member of this chat');
        }

        const offset = (page - 1) * limit;

        // Get messages
        const messages = await db.select()
            .from(chat_messages)
            .where(and(
                eq(chat_messages.chatroom_id, chatId),
                eq(chat_messages.is_deleted, false)
            ))
            .orderBy(desc(chat_messages.created_at))
            .limit(limit)
            .offset(offset);

        // Get total count
        const totalCount = await db.select({ count: sql<number>`count(*)` })
            .from(chat_messages)
            .where(and(
                eq(chat_messages.chatroom_id, chatId),
                eq(chat_messages.is_deleted, false)
            ));

        return {
            messages: messages.map(this.formatChatMessage).reverse(), // Reverse to show chronological order
            pagination: {
                page,
                limit,
                total: totalCount[0]?.count || 0
            }
        };
    }

    /**
     * Edit message
     */
    async editMessage(messageId: string, userId: string, newContent: string): Promise<ChatMessage> {
        const [message] = await db.select()
            .from(chat_messages)
            .where(eq(chat_messages.message_id, messageId))
            .limit(1);

        if (!message) {
            throw new Error('Message not found');
        }

        if (message.user_id !== userId) {
            throw new Error('Can only edit own messages');
        }

        // Check 2-minute edit window
        const messageTime = message.created_at;
        const now = new Date();
        const timeDiff = now.getTime() - messageTime.getTime();
        const twoMinutes = 2 * 60 * 1000; // 2 minutes in milliseconds

        if (timeDiff > twoMinutes) {
            throw new Error('Messages can only be edited within 2 minutes of sending');
        }

        const [updatedMessage] = await db.update(chat_messages)
            .set({
                content: newContent,
                is_edited: true,
                updated_at: new Date()
            })
            .where(eq(chat_messages.message_id, messageId))
            .returning();

        return this.formatChatMessage(updatedMessage);
    }

    /**
     * Delete message
     */
    async deleteMessage(messageId: string, userId: string): Promise<void> {
        const [message] = await db.select()
            .from(chat_messages)
            .where(eq(chat_messages.message_id, messageId))
            .limit(1);

        if (!message) {
            throw new Error('Message not found');
        }

        // Check permissions
        const membership = await db.select()
            .from(chatroom_members)
            .where(and(
                eq(chatroom_members.chatroom_id, message.chatroom_id),
                eq(chatroom_members.user_id, userId)
            ))
            .limit(1);

        const isOwner = message.user_id === userId;
        const isAdmin = membership.length > 0 && membership[0].role === ChatMemberRole.ADMIN;
        const isModerator = membership.length > 0 && membership[0].role === ChatMemberRole.MODERATOR;

        if (!isOwner && !isAdmin && !isModerator) {
            throw new Error('Insufficient permissions to delete message');
        }

        await db.update(chat_messages)
            .set({
                is_deleted: true,
                deleted_reason: 'User deleted',
                deleted_at: new Date()
            })
            .where(eq(chat_messages.message_id, messageId));
    }

    /**
     * Add reaction to message
     */
    async addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
        // Check if message exists and user can access it
        const message = await db.select()
            .from(chat_messages)
            .where(eq(chat_messages.message_id, messageId))
            .limit(1);

        if (message.length === 0) {
            throw new Error('Message not found');
        }

        // Check if user is member of the chat
        const membership = await db.select()
            .from(chatroom_members)
            .where(and(
                eq(chatroom_members.chatroom_id, message[0].chatroom_id),
                eq(chatroom_members.user_id, userId),
                eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
            ))
            .limit(1);

        if (membership.length === 0) {
            throw new Error('User is not a member of this chat');
        }

        await db.insert(message_reactions).values({
            message_id: messageId,
            user_id: userId,
            emoji
        });
    }

    /**
     * Search messages in a chat
     */
    async searchMessages(chatId: string, userId: string, query: string, limit: number = 50): Promise<ChatMessage[]> {
        // Verify user is member
        const membership = await db.select()
            .from(chatroom_members)
            .where(and(
                eq(chatroom_members.chatroom_id, chatId),
                eq(chatroom_members.user_id, userId),
                eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
            ))
            .limit(1);

        if (membership.length === 0) {
            throw new Error('User is not a member of this chat');
        }

        const messages = await db.select()
            .from(chat_messages)
            .where(sql`${chat_messages.chatroom_id} = ${chatId} AND ${chat_messages.content} ILIKE ${'%' + query + '%'} AND ${chat_messages.is_deleted} = false`)
            .orderBy(desc(chat_messages.created_at))
            .limit(limit);

        return messages.map(this.formatChatMessage);
    }

    /**
     * Clear chat history for private conversations
     */
    async clearChatHistory(chatId: string, userId: string): Promise<void> {
        // Verify user is member
        const membership = await db.select()
            .from(chatroom_members)
            .where(and(
                eq(chatroom_members.chatroom_id, chatId),
                eq(chatroom_members.user_id, userId),
                eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
            ))
            .limit(1);

        if (membership.length === 0) {
            throw new Error('User is not a member of this chat');
        }

        // Check if this is a direct chat (private conversation)
        const [chat] = await db.select()
            .from(chatrooms)
            .where(eq(chatrooms.chatroom_id, chatId))
            .limit(1);

        if (!chat || chat.chatroom_type !== ChatType.DIRECT) {
            throw new Error('Chat history can only be cleared for private conversations');
        }

        // Soft delete all messages in the chat
        await db.update(chat_messages)
            .set({
                is_deleted: true,
                deleted_reason: 'Chat history cleared',
                deleted_at: new Date()
            })
            .where(eq(chat_messages.chatroom_id, chatId));
    }

    /**
     * Create direct chat between two users
     */
    async createDirectChat(userId1: string, userId2: string): Promise<ChatRoom> {
        // Check if direct chat already exists
        const existingChat = await db.select()
            .from(chatrooms)
            .innerJoin(chatroom_members, eq(chatrooms.chatroom_id, chatroom_members.chatroom_id))
            .where(and(
                eq(chatrooms.chatroom_type, ChatType.DIRECT),
                sql`EXISTS (
                    SELECT 1 FROM chatroom_members cm2
                    WHERE cm2.chatroom_id = chatrooms.chatroom_id
                    AND cm2.user_id IN (${userId1}, ${userId2})
                    GROUP BY cm2.chatroom_id
                    HAVING COUNT(*) = 2
                )`
            ))
            .limit(1);

        if (existingChat.length > 0) {
            const participants = await this.getChatParticipants(existingChat[0].chatrooms.chatroom_id);
            return this.formatChatRoom(existingChat[0].chatrooms, participants.map(p => p.userId));
        }

        // Create new direct chat
        return this.createChat(ChatType.DIRECT, [userId1, userId2]);
    }

    /**
     * Get chat participants
     */
    private async getChatParticipants(chatId: string): Promise<ChatParticipant[]> {
        const participants = await db.select()
            .from(chatroom_members)
            .where(and(
                eq(chatroom_members.chatroom_id, chatId),
                eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
            ));

        return participants.map(p => ({
            userId: p.user_id,
            role: p.role as ChatMemberRole,
            joinedAt: p.joined_at || new Date(),
            lastReadAt: p.last_read_at || undefined,
            status: p.status as ChatMemberStatus,
            permissions: p.permissions as Record<string, boolean> | undefined
        }));
    }

    /**
     * Format chat room for API response
     */
    private formatChatRoom(chat: any, participantIds: string[]): ChatRoom {
        return {
            chatId: chat.chatroom_id,
            type: chat.chatroom_type as ChatType,
            name: chat.name,
            description: chat.description,
            avatarUrl: chat.avatar_url,
            createdBy: chat.created_by,
            participants: participantIds.map(id => ({
                userId: id,
                role: ChatMemberRole.MEMBER,
                joinedAt: new Date(),
                status: ChatMemberStatus.ACTIVE
            })),
            lastActivity: chat.last_activity || chat.created_at,
            settings: chat.settings as Record<string, any>,
            status: chat.status,
            createdAt: chat.created_at,
            updatedAt: chat.updated_at
        };
    }

    /**
     * Format chat message for API response
     */
    private formatChatMessage(message: any): ChatMessage {
        return {
            messageId: message.message_id,
            chatId: message.chatroom_id,
            senderId: message.user_id,
            content: message.content,
            messageType: message.message_type as MessageType,
            replyToMessageId: message.reply_to_message_id,
            metadata: message.metadata as Record<string, any>,
            isEdited: message.is_edited,
            isDeleted: message.is_deleted,
            createdAt: message.created_at,
            updatedAt: message.updated_at,
            deletedAt: message.deleted_at
        };
    }
}

export const chatService = new ChatService();
