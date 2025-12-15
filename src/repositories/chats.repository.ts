import { db } from '../db/dbconfig';
import {
    chatrooms,
    chatroom_members,
    chat_messages,
    message_attachments,
    users,
    Chatroom,
    NewChatroom,
    NewChatroomMember,
    NewChatMessage,
    NewMessageAttachment,
    NewMessageReadStatus,
    message_read_status,
} from '../db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

export class ChatRepository {
    /**
     * Find a direct chat between two users
     */
    async findDirectChatBetweenUsers(userId1: string, userId2: string) {
        // We need to find a chatroom of type 'direct' where both users are members
        // This is a bit complex in SQL/Drizzle without a direct join on two membership rows
        // tailored for performance.
        // simpler approach: find common chatroom IDs for both users that are type 'direct'

        const result = await db.execute(sql`
      SELECT c.chatroom_id
      FROM ${chatrooms} c
      JOIN ${chatroom_members} cm1 ON c.chatroom_id = cm1.chatroom_id
      JOIN ${chatroom_members} cm2 ON c.chatroom_id = cm2.chatroom_id
      WHERE c.chatroom_type = 'direct'
        AND cm1.user_id = ${userId1}
        AND cm2.user_id = ${userId2}
      LIMIT 1;
    `);

        // Drizzle execute returns raw result, parsing depends on driver (likely postgres.js or node-postgres)
        // Assuming standard array of rows
        if (result.rows && result.rows.length > 0) {
            const row = result.rows[0] as any;
            return this.getChatroomById(row.chatroom_id);
        }

        return null;
    }

    async getChatroomById(chatroomId: string) {
        const result = await db
            .select()
            .from(chatrooms)
            .where(eq(chatrooms.chatroom_id, chatroomId))
            .limit(1);
        return result[0] || null;
    }

    async createChatroom(data: NewChatroom) {
        const result = await db.insert(chatrooms).values(data).returning();
        return result[0];
    }

    async addMember(data: NewChatroomMember) {
        const result = await db.insert(chatroom_members).values(data).returning();
        return result[0];
    }

    async isMember(chatroomId: string, userId: string): Promise<boolean> {
        const result = await db
            .select()
            .from(chatroom_members)
            .where(
                and(
                    eq(chatroom_members.chatroom_id, chatroomId),
                    eq(chatroom_members.user_id, userId),
                    eq(chatroom_members.status, 'active')
                )
            )
            .limit(1);
        return result.length > 0;
    }

    async getChatMessages(chatroomId: string, limit: number = 50, offset: number = 0) {
        // Fetch messages with sender info and attachments
        // Drizzle's "query" builder is often better for relations, but sticking to explicit joins for control or query builder if relations are set up.
        // Since relations are defined in schema.ts, we can use db.query.chat_messages if supported,
        // but explicit selects are often safer if we want a flat structure or specific fields.

        // Let's use a robust join query to get user details
        const messages = await db
            .select({
                message_id: chat_messages.message_id,
                chatroom_id: chat_messages.chatroom_id,
                user_id: chat_messages.user_id,
                content: chat_messages.content,
                message_type: chat_messages.message_type,
                metadata: chat_messages.metadata,
                created_at: chat_messages.created_at,
                sender_first_name: users.first_name,
                sender_last_name: users.last_name,
                sender_image_url: users.image_url,
            })
            .from(chat_messages)
            .leftJoin(users, eq(chat_messages.user_id, users.user_id))
            .where(
                and(
                    eq(chat_messages.chatroom_id, chatroomId),
                    eq(chat_messages.is_deleted, false)
                )
            )
            .orderBy(desc(chat_messages.created_at))
            .limit(limit)
            .offset(offset);

        // We also need attachments. Fetching them in a separate query or aggregation.
        // Separate query is easier to type.
        if (messages.length === 0) return { messages: [], total: 0 };

        const messageIds = messages.map((m) => m.message_id);

        const attachments = await db
            .select()
            .from(message_attachments)
            .where(inArray(message_attachments.message_id, messageIds));

        // Stitch attachments
        const messagesWithAttachments = messages.map((msg) => {
            return {
                ...msg,
                attachments: attachments.filter((a) => a.message_id === msg.message_id),
            };
        });

        return messagesWithAttachments.reverse(); // Return oldest first for chat UI usually, or keep desc for infinite scroll
    }

    async createMessage(data: NewChatMessage) {
        const result = await db.insert(chat_messages).values(data).returning();
        return result[0];
    }

    async addAttachment(data: NewMessageAttachment) {
        const result = await db.insert(message_attachments).values(data).returning();
        return result[0];
    }

    async updateChatLastMessage(chatroomId: string, messageId: string) {
        await db
            .update(chatrooms)
            .set({
                last_message_id: messageId,
                last_activity: new Date(),
            })
            .where(eq(chatrooms.chatroom_id, chatroomId));
    }
}

export const chatRepository = new ChatRepository();
