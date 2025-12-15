import { chatRepository } from '../repositories/chats.repository';
import { NewChatroom, NewChatMessage, NewMessageAttachment } from '../db/schema';

// Helper for HTTP errors
const createHttpError = (status: number, message: string) => {
    const err = new Error(message) as any;
    err.status = status;
    return err;
};

export class ChatService {
    /**
     * Get or create a direct chat between two users
     */
    async getOrCreateDirectChat(currentUserId: string, targetUserId: string) {
        if (currentUserId === targetUserId) {
            throw new Error("Cannot chat with yourself");
        }

        // Check if chat exists
        const existingChat = await chatRepository.findDirectChatBetweenUsers(currentUserId, targetUserId);
        if (existingChat) {
            return existingChat;
        }

        // Create new chat
        const newChatData: NewChatroom = {
            chatroom_type: 'direct',
            created_by: currentUserId,
            member_count: 2,
            status: 'active',
            // For direct chats, name/avatar might be dynamic or null
        };

        const createdChat = await chatRepository.createChatroom(newChatData);

        // Add members
        await chatRepository.addMember({
            chatroom_id: createdChat.chatroom_id,
            user_id: currentUserId,
            role: 'member',
            status: 'active',
        });

        await chatRepository.addMember({
            chatroom_id: createdChat.chatroom_id,
            user_id: targetUserId,
            role: 'member',
            status: 'active',
        });

        return createdChat;
    }

    /**
     * Send a message to a chatroom
     */
    async sendMessage(
        senderId: string,
        chatroomId: string,
        content: string | undefined,
        attachments: any[] = [] // Array of attachment objects
    ) {
        // Verify membership
        const isMember = await chatRepository.isMember(chatroomId, senderId);
        if (!isMember) {
            throw createHttpError(403, "You are not a member of this chat");
        }

        // Create message
        const messageData: NewChatMessage = {
            chatroom_id: chatroomId,
            user_id: senderId,
            content: content || '', // Handle file-only messages logic if needed
            message_type: attachments.length > 0 ? 'file' : 'text', // Simplification
            is_deleted: false,
        };

        const createdMessage = await chatRepository.createMessage(messageData);

        // Handle attachments (if any)
        if (attachments && attachments.length > 0) {
            for (const att of attachments) {
                const attachmentData: NewMessageAttachment = {
                    message_id: createdMessage.message_id,
                    file_type: att.fileType, // enum from schema
                    file_url: att.fileUrl,
                    file_name: att.fileName,
                    file_size_bytes: att.fileSize,
                    mime_type: att.mimeType,
                };
                await chatRepository.addAttachment(attachmentData);
            }
        }

        // Update chatroom last_message
        await chatRepository.updateChatLastMessage(chatroomId, createdMessage.message_id);

        return createdMessage;
    }

    /**
     * Get chat history with pagination
     */
    async getChatHistory(userId: string, chatroomId: string, limit: number = 50, offset: number = 0) {
        // Verify membership
        const isMember = await chatRepository.isMember(chatroomId, userId);
        if (!isMember) {
            throw createHttpError(403, "You are not a member of this chat");
        }

        return await chatRepository.getChatMessages(chatroomId, limit, offset);
    }
}

export const chatService = new ChatService();
