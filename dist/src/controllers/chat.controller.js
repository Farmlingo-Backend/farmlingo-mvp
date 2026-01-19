"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeMemberRole = exports.removeChatroomMember = exports.rejectJoinRequest = exports.approveJoinRequest = exports.requestJoin = exports.inviteMember = exports.getChatroomMembers = exports.addChatroomMember = exports.getAllChatMessagesAdmin = exports.clearChatHistory = exports.getMessageHistory = exports.searchMessages = exports.addMessageReaction = exports.deleteChatMessage = exports.updateChatMessage = exports.getAllChatroomsAdmin = exports.createChatMessage = exports.getChatMessages = exports.deleteChatroom = exports.updateChatroom = exports.getChatroomById = exports.createChatroom = exports.getChatrooms = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const dbconfig_1 = require("../db/dbconfig");
const schema_1 = require("../db/schema");
const createHttpError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};
function toNumber(value) {
    if (value === undefined || value === null || value === '')
        return undefined;
    const n = typeof value === 'string' ? Number(value) : value;
    return Number.isFinite(n) ? n : undefined;
}
const getChatrooms = async (req, res, next) => {
    var _a, _b;
    try {
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10, 1);
        const offset = (page - 1) * limit;
        const rows = await dbconfig_1.db.select().from(schema_1.chatrooms).limit(limit).offset(offset);
        res.status(200).json({ data: rows, pagination: { page, limit } });
    }
    catch (err) {
        next(err);
    }
};
exports.getChatrooms = getChatrooms;
const createChatroom = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const body = req.body;
        let settings = body.settings;
        if (typeof settings === 'string') {
            try {
                settings = settings ? JSON.parse(settings) : undefined;
            }
            catch {
                return next(createHttpError(400, 'Invalid settings JSON'));
            }
        }
        const [created] = await dbconfig_1.db
            .insert(schema_1.chatrooms)
            .values({
            chatroom_type: body.chatroom_type,
            name: body.name,
            description: body.description,
            avatar_url: body.avatar_url,
            created_by: userId,
            settings: settings,
        })
            .returning();
        // Add creator as admin member
        await dbconfig_1.db.insert(schema_1.chatroom_members).values({
            chatroom_id: created.chatroom_id,
            user_id: userId,
            role: 'admin',
            status: 'active',
            invited_by: userId,
        });
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createChatroom = createChatroom;
const getChatroomById = async (req, res, next) => {
    try {
        const { chatroomId } = req.params;
        const rows = await dbconfig_1.db.select().from(schema_1.chatrooms).where((0, drizzle_orm_1.eq)(schema_1.chatrooms.chatroom_id, chatroomId)).limit(1);
        const room = rows[0];
        if (!room)
            return next(createHttpError(404, 'Chat room not found'));
        res.status(200).json(room);
    }
    catch (err) {
        next(err);
    }
};
exports.getChatroomById = getChatroomById;
const updateChatroom = async (req, res, next) => {
    try {
        const { chatroomId } = req.params;
        const body = req.body;
        let settings = body.settings;
        if (typeof settings === 'string') {
            try {
                settings = settings ? JSON.parse(settings) : undefined;
            }
            catch {
                return next(createHttpError(400, 'Invalid settings JSON'));
            }
        }
        const [updated] = await dbconfig_1.db
            .update(schema_1.chatrooms)
            .set({
            chatroom_type: body.chatroom_type,
            name: body.name,
            description: body.description,
            avatar_url: body.avatar_url,
            settings: settings,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.chatrooms.chatroom_id, chatroomId))
            .returning();
        if (!updated)
            return next(createHttpError(404, 'Chat room not found'));
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateChatroom = updateChatroom;
const deleteChatroom = async (req, res, next) => {
    try {
        const { chatroomId } = req.params;
        const result = await dbconfig_1.db.delete(schema_1.chatrooms).where((0, drizzle_orm_1.eq)(schema_1.chatrooms.chatroom_id, chatroomId)).returning();
        if (result.length === 0)
            return next(createHttpError(404, 'Chat room not found'));
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteChatroom = deleteChatroom;
const getChatMessages = async (req, res, next) => {
    var _a, _b;
    try {
        const { chatroomId } = req.params;
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '50'), 10) || 50, 1);
        const offset = (page - 1) * limit;
        const rows = await dbconfig_1.db
            .select()
            .from(schema_1.chat_messages)
            .where((0, drizzle_orm_1.eq)(schema_1.chat_messages.chatroom_id, chatroomId))
            .limit(limit)
            .offset(offset);
        res.status(200).json({ data: rows, pagination: { page, limit } });
    }
    catch (err) {
        next(err);
    }
};
exports.getChatMessages = getChatMessages;
const createChatMessage = async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const { chatroomId } = req.params;
        const body = req.body;
        let metadata = body.metadata;
        if (typeof metadata === 'string') {
            try {
                metadata = metadata ? JSON.parse(metadata) : undefined;
            }
            catch {
                return next(createHttpError(400, 'Invalid metadata JSON'));
            }
        }
        const [created] = await dbconfig_1.db
            .insert(schema_1.chat_messages)
            .values({
            chatroom_id: chatroomId,
            user_id: userId,
            reply_to_message_id: body.reply_to_message_id,
            content: body.content,
            message_type: body.message_type,
            metadata: metadata,
        })
            .returning();
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createChatMessage = createChatMessage;
// Admin endpoints for managing chatrooms
const getAllChatroomsAdmin = async (req, res, next) => {
    var _a, _b;
    try {
        const auth = req.auth;
        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (auth.role !== 'admin' && auth.role !== 'super_admin') {
            return next(createHttpError(403, 'Forbidden: Admin access required'));
        }
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '50'), 10) || 50, 1);
        const offset = (page - 1) * limit;
        const rows = await dbconfig_1.db.select().from(schema_1.chatrooms).limit(limit).offset(offset);
        res.status(200).json({ data: rows, pagination: { page, limit } });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllChatroomsAdmin = getAllChatroomsAdmin;
// Message management endpoints
const updateChatMessage = async (req, res, next) => {
    var _a;
    try {
        const { messageId } = req.params;
        const { content } = req.body;
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (!content || !content.trim()) {
            return next(createHttpError(400, 'Message content is required'));
        }
        // Get existing message to check ownership
        const existingMessage = await dbconfig_1.db
            .select()
            .from(schema_1.chat_messages)
            .where((0, drizzle_orm_1.eq)(schema_1.chat_messages.message_id, messageId))
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
        const [updatedMessage] = await dbconfig_1.db
            .update(schema_1.chat_messages)
            .set({
            content: content.trim(),
            is_edited: true,
            updated_at: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.chat_messages.message_id, messageId))
            .returning();
        res.status(200).json(updatedMessage);
    }
    catch (err) {
        next(err);
    }
};
exports.updateChatMessage = updateChatMessage;
const deleteChatMessage = async (req, res, next) => {
    var _a;
    try {
        const { messageId } = req.params;
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        // Get existing message to check ownership
        const existingMessage = await dbconfig_1.db
            .select()
            .from(schema_1.chat_messages)
            .where((0, drizzle_orm_1.eq)(schema_1.chat_messages.message_id, messageId))
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
        const [deletedMessage] = await dbconfig_1.db
            .update(schema_1.chat_messages)
            .set({
            is_deleted: true,
            deleted_reason: 'User deleted',
            deleted_at: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.chat_messages.message_id, messageId))
            .returning();
        res.status(200).json(deletedMessage);
    }
    catch (err) {
        next(err);
    }
};
exports.deleteChatMessage = deleteChatMessage;
const addMessageReaction = async (req, res, next) => {
    var _a;
    try {
        const { messageId } = req.params;
        const { emoji } = req.body;
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (!emoji) {
            return next(createHttpError(400, 'Emoji is required'));
        }
        // Check if message exists
        const messageExists = await dbconfig_1.db
            .select({ message_id: schema_1.chat_messages.message_id })
            .from(schema_1.chat_messages)
            .where((0, drizzle_orm_1.eq)(schema_1.chat_messages.message_id, messageId))
            .limit(1);
        if (messageExists.length === 0) {
            return next(createHttpError(404, 'Message not found'));
        }
        // Add reaction
        const [reaction] = await dbconfig_1.db
            .insert(schema_1.message_reactions)
            .values({
            message_id: messageId,
            user_id: userId,
            emoji: emoji
        })
            .returning();
        res.status(201).json(reaction);
    }
    catch (err) {
        next(err);
    }
};
exports.addMessageReaction = addMessageReaction;
const searchMessages = async (req, res, next) => {
    var _a;
    try {
        const { chatroomId } = req.params;
        const { q: searchQuery, limit = 50, offset = 0 } = req.query;
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (!searchQuery || typeof searchQuery !== 'string') {
            return next(createHttpError(400, 'Search query is required'));
        }
        // Search messages in the chatroom
        const messages = await dbconfig_1.db
            .select()
            .from(schema_1.chat_messages)
            .where((0, drizzle_orm_1.sql) `${schema_1.chat_messages.chatroom_id} = ${chatroomId} AND ${schema_1.chat_messages.content} ILIKE ${'%' + searchQuery + '%'} AND ${schema_1.chat_messages.is_deleted} = false`)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.chat_messages.created_at))
            .limit(Number(limit))
            .offset(Number(offset));
        res.status(200).json({
            messages,
            pagination: { limit: Number(limit), offset: Number(offset) }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.searchMessages = searchMessages;
const getMessageHistory = async (req, res, next) => {
    var _a;
    try {
        const { chatroomId } = req.params;
        const { days = 30, limit = 100 } = req.query;
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        // Get messages from the last N days
        const messages = await dbconfig_1.db
            .select()
            .from(schema_1.chat_messages)
            .where((0, drizzle_orm_1.sql) `${schema_1.chat_messages.chatroom_id} = ${chatroomId} AND ${schema_1.chat_messages.created_at} >= NOW() - INTERVAL '${days} days' AND ${schema_1.chat_messages.is_deleted} = false`)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.chat_messages.created_at))
            .limit(Number(limit));
        res.status(200).json({
            messages,
            period: `${days} days`
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getMessageHistory = getMessageHistory;
// Admin endpoints for managing chat messages
const clearChatHistory = async (req, res, next) => {
    var _a;
    try {
        const { chatroomId } = req.params;
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        // Verify user is member of the chatroom
        const membership = await dbconfig_1.db.select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${userId} AND ${schema_1.chatroom_members.status} = 'active'`)
            .limit(1);
        if (membership.length === 0) {
            return next(createHttpError(403, 'You are not a member of this chatroom'));
        }
        // Verify this is a direct chat (private conversation)
        const [chat] = await dbconfig_1.db.select()
            .from(schema_1.chatrooms)
            .where((0, drizzle_orm_1.eq)(schema_1.chatrooms.chatroom_id, chatroomId))
            .limit(1);
        if (!chat || chat.chatroom_type !== 'direct') {
            return next(createHttpError(400, 'Chat history can only be cleared for private conversations'));
        }
        // Soft delete all messages in the chat
        await dbconfig_1.db.update(schema_1.chat_messages)
            .set({
            is_deleted: true,
            deleted_reason: 'Chat history cleared',
            deleted_at: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.chat_messages.chatroom_id, chatroomId));
        res.status(200).json({ message: 'Chat history cleared successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.clearChatHistory = clearChatHistory;
const getAllChatMessagesAdmin = async (req, res, next) => {
    var _a, _b;
    try {
        const auth = req.auth;
        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (auth.role !== 'admin' && auth.role !== 'super_admin') {
            return next(createHttpError(403, 'Forbidden: Admin access required'));
        }
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '100'), 10) || 100, 1);
        const offset = (page - 1) * limit;
        const rows = await dbconfig_1.db.select().from(schema_1.chat_messages).limit(limit).offset(offset);
        res.status(200).json({ data: rows, pagination: { page, limit } });
    }
    catch (err) {
        next(err);
    }
};
exports.getAllChatMessagesAdmin = getAllChatMessagesAdmin;
// Member management endpoints
const addChatroomMember = async (req, res, next) => {
    var _a;
    try {
        const { chatroomId } = req.params;
        const { user_id, role = 'member' } = req.body;
        const currentUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!currentUserId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (!user_id) {
            return next(createHttpError(400, 'user_id is required'));
        }
        // Check if current user is admin of the chatroom
        const membership = await dbconfig_1.db
            .select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${currentUserId} AND ${schema_1.chatroom_members.role} = 'admin' AND ${schema_1.chatroom_members.status} = 'active'`)
            .limit(1);
        if (membership.length === 0) {
            return next(createHttpError(403, 'You must be an admin of this chatroom to add members'));
        }
        // Check if user is already a member
        const existingMember = await dbconfig_1.db
            .select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${user_id}`)
            .limit(1);
        if (existingMember.length > 0) {
            return next(createHttpError(400, 'User is already a member of this chatroom'));
        }
        // Add member
        const [addedMember] = await dbconfig_1.db
            .insert(schema_1.chatroom_members)
            .values({
            chatroom_id: chatroomId,
            user_id: user_id,
            role: role,
            status: 'active',
            invited_by: currentUserId,
        })
            .returning();
        // Update member count
        await dbconfig_1.db
            .update(schema_1.chatrooms)
            .set({ member_count: (0, drizzle_orm_1.sql) `${schema_1.chatrooms.member_count} + 1` })
            .where((0, drizzle_orm_1.eq)(schema_1.chatrooms.chatroom_id, chatroomId));
        res.status(201).json(addedMember);
    }
    catch (err) {
        next(err);
    }
};
exports.addChatroomMember = addChatroomMember;
const getChatroomMembers = async (req, res, next) => {
    try {
        const { chatroomId } = req.params;
        const members = await dbconfig_1.db
            .select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.status} = 'active'`);
        res.status(200).json({ data: members });
    }
    catch (err) {
        next(err);
    }
};
exports.getChatroomMembers = getChatroomMembers;
const inviteMember = async (req, res, next) => {
    var _a;
    try {
        const { chatroomId } = req.params;
        const { user_id, email, message } = req.body;
        const currentUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!currentUserId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (!user_id && !email) {
            return next(createHttpError(400, 'Either user_id or email is required'));
        }
        // Check if current user is admin of the chatroom
        const membership = await dbconfig_1.db
            .select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${currentUserId} AND ${schema_1.chatroom_members.role} = 'admin' AND ${schema_1.chatroom_members.status} = 'active'`)
            .limit(1);
        if (membership.length === 0) {
            return next(createHttpError(403, 'You must be an admin of this chatroom to invite members'));
        }
        // Check if already invited
        if (user_id) {
            const existingInvite = await dbconfig_1.db
                .select()
                .from(schema_1.chatroomInvitationsTable)
                .where((0, drizzle_orm_1.sql) `${schema_1.chatroomInvitationsTable.chatroom_id} = ${chatroomId} AND ${schema_1.chatroomInvitationsTable.invited_user_id} = ${user_id} AND ${schema_1.chatroomInvitationsTable.status} = 'pending'`)
                .limit(1);
            if (existingInvite.length > 0) {
                return next(createHttpError(400, 'User already has a pending invitation'));
            }
            // Check if already member
            const existingMember = await dbconfig_1.db
                .select()
                .from(schema_1.chatroom_members)
                .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${user_id} AND ${schema_1.chatroom_members.status} = 'active'`)
                .limit(1);
            if (existingMember.length > 0) {
                return next(createHttpError(400, 'User is already a member'));
            }
        }
        else if (email) {
            const existingInvite = await dbconfig_1.db
                .select()
                .from(schema_1.chatroomInvitationsTable)
                .where((0, drizzle_orm_1.sql) `${schema_1.chatroomInvitationsTable.chatroom_id} = ${chatroomId} AND ${schema_1.chatroomInvitationsTable.invited_email} = ${email} AND ${schema_1.chatroomInvitationsTable.status} = 'pending'`)
                .limit(1);
            if (existingInvite.length > 0) {
                return next(createHttpError(400, 'Email already has a pending invitation'));
            }
        }
        // Generate invitation code
        const invitationCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const [invitation] = await dbconfig_1.db
            .insert(schema_1.chatroomInvitationsTable)
            .values({
            chatroom_id: chatroomId,
            invited_user_id: user_id || null,
            invited_email: email || null,
            invitation_code: invitationCode,
            invited_by: currentUserId,
            message: message || null,
        })
            .returning();
        res.status(201).json(invitation);
    }
    catch (err) {
        next(err);
    }
};
exports.inviteMember = inviteMember;
const requestJoin = async (req, res, next) => {
    var _a;
    try {
        const { chatroomId } = req.params;
        const { message } = req.body;
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!userId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        // Check if chatroom exists and requires approval
        const [chatroom] = await dbconfig_1.db
            .select()
            .from(schema_1.chatrooms)
            .where((0, drizzle_orm_1.eq)(schema_1.chatrooms.chatroom_id, chatroomId))
            .limit(1);
        if (!chatroom) {
            return next(createHttpError(404, 'Chatroom not found'));
        }
        // Check if user is already a member
        const existingMember = await dbconfig_1.db
            .select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${userId}`)
            .limit(1);
        if (existingMember.length > 0) {
            if (existingMember[0].status === 'active') {
                return next(createHttpError(400, 'You are already a member of this chatroom'));
            }
            else if (existingMember[0].status === 'banned') {
                return next(createHttpError(403, 'You are banned from this chatroom'));
            }
        }
        // Check if there's already a pending request
        const existingRequest = await dbconfig_1.db
            .select()
            .from(schema_1.membershipRequestsTable)
            .where((0, drizzle_orm_1.sql) `${schema_1.membershipRequestsTable.chatroom_id} = ${chatroomId} AND ${schema_1.membershipRequestsTable.user_id} = ${userId} AND ${schema_1.membershipRequestsTable.status} = 'pending'`)
            .limit(1);
        if (existingRequest.length > 0) {
            return next(createHttpError(400, 'You already have a pending join request'));
        }
        // Create join request
        const [request] = await dbconfig_1.db
            .insert(schema_1.membershipRequestsTable)
            .values({
            chatroom_id: chatroomId,
            user_id: userId,
            message: message || null,
            status: 'pending',
        })
            .returning();
        res.status(201).json(request);
    }
    catch (err) {
        next(err);
    }
};
exports.requestJoin = requestJoin;
const approveJoinRequest = async (req, res, next) => {
    var _a;
    try {
        const { chatroomId, requestId } = req.params;
        const currentUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!currentUserId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        // Check if current user is admin of the chatroom
        const membership = await dbconfig_1.db
            .select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${currentUserId} AND ${schema_1.chatroom_members.role} = 'admin' AND ${schema_1.chatroom_members.status} = 'active'`)
            .limit(1);
        if (membership.length === 0) {
            return next(createHttpError(403, 'You must be an admin of this chatroom to approve requests'));
        }
        // Get the request
        const [request] = await dbconfig_1.db
            .select()
            .from(schema_1.membershipRequestsTable)
            .where((0, drizzle_orm_1.sql) `${schema_1.membershipRequestsTable.request_id} = ${requestId} AND ${schema_1.membershipRequestsTable.chatroom_id} = ${chatroomId} AND ${schema_1.membershipRequestsTable.status} = 'pending'`)
            .limit(1);
        if (!request) {
            return next(createHttpError(404, 'Join request not found'));
        }
        // Check if user is already a member
        const existingMember = await dbconfig_1.db
            .select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${request.user_id}`)
            .limit(1);
        if (existingMember.length > 0) {
            // If banned, can't approve
            if (existingMember[0].status === 'banned') {
                return next(createHttpError(400, 'User is banned from this chatroom'));
            }
            // If already active, just update request
            await dbconfig_1.db
                .update(schema_1.membershipRequestsTable)
                .set({
                status: 'approved',
                reviewed_by: currentUserId,
                reviewed_at: new Date()
            })
                .where((0, drizzle_orm_1.eq)(schema_1.membershipRequestsTable.request_id, requestId));
            res.status(200).json({ message: 'User is already a member, request approved' });
            return;
        }
        // Add user as member
        await dbconfig_1.db.insert(schema_1.chatroom_members).values({
            chatroom_id: chatroomId,
            user_id: request.user_id,
            role: 'member',
            status: 'active',
            invited_by: currentUserId,
        });
        // Update member count
        await dbconfig_1.db
            .update(schema_1.chatrooms)
            .set({ member_count: (0, drizzle_orm_1.sql) `${schema_1.chatrooms.member_count} + 1` })
            .where((0, drizzle_orm_1.eq)(schema_1.chatrooms.chatroom_id, chatroomId));
        // Update request
        await dbconfig_1.db
            .update(schema_1.membershipRequestsTable)
            .set({
            status: 'approved',
            reviewed_by: currentUserId,
            reviewed_at: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.membershipRequestsTable.request_id, requestId));
        res.status(200).json({ message: 'Join request approved' });
    }
    catch (err) {
        next(err);
    }
};
exports.approveJoinRequest = approveJoinRequest;
const rejectJoinRequest = async (req, res, next) => {
    var _a;
    try {
        const { chatroomId, requestId } = req.params;
        const { reason } = req.body;
        const currentUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!currentUserId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        // Check if current user is admin of the chatroom
        const membership = await dbconfig_1.db
            .select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${currentUserId} AND ${schema_1.chatroom_members.role} = 'admin' AND ${schema_1.chatroom_members.status} = 'active'`)
            .limit(1);
        if (membership.length === 0) {
            return next(createHttpError(403, 'You must be an admin of this chatroom to reject requests'));
        }
        // Update request
        const [updated] = await dbconfig_1.db
            .update(schema_1.membershipRequestsTable)
            .set({
            status: 'rejected',
            reviewed_by: currentUserId,
            reviewed_at: new Date(),
            response_message: reason || null
        })
            .where((0, drizzle_orm_1.sql) `${schema_1.membershipRequestsTable.request_id} = ${requestId} AND ${schema_1.membershipRequestsTable.chatroom_id} = ${chatroomId} AND ${schema_1.membershipRequestsTable.status} = 'pending'`)
            .returning();
        if (!updated) {
            return next(createHttpError(404, 'Join request not found'));
        }
        res.status(200).json({ message: 'Join request rejected' });
    }
    catch (err) {
        next(err);
    }
};
exports.rejectJoinRequest = rejectJoinRequest;
const removeChatroomMember = async (req, res, next) => {
    var _a;
    try {
        const { chatroomId, userId } = req.params;
        const currentUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!currentUserId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        // Check if current user is admin of the chatroom
        const membership = await dbconfig_1.db
            .select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${currentUserId} AND ${schema_1.chatroom_members.role} = 'admin' AND ${schema_1.chatroom_members.status} = 'active'`)
            .limit(1);
        if (membership.length === 0) {
            return next(createHttpError(403, 'You must be an admin of this chatroom to remove members'));
        }
        // Can't remove yourself
        if (userId === currentUserId) {
            return next(createHttpError(400, 'You cannot remove yourself from the chatroom'));
        }
        // Update member status
        const [removed] = await dbconfig_1.db
            .update(schema_1.chatroom_members)
            .set({
            status: 'removed',
            left_at: new Date()
        })
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${userId} AND ${schema_1.chatroom_members.status} = 'active'`)
            .returning();
        if (!removed) {
            return next(createHttpError(404, 'Member not found'));
        }
        // Update member count
        await dbconfig_1.db
            .update(schema_1.chatrooms)
            .set({ member_count: (0, drizzle_orm_1.sql) `${schema_1.chatrooms.member_count} - 1` })
            .where((0, drizzle_orm_1.eq)(schema_1.chatrooms.chatroom_id, chatroomId));
        res.status(200).json({ message: 'Member removed successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.removeChatroomMember = removeChatroomMember;
const changeMemberRole = async (req, res, next) => {
    var _a;
    try {
        const { chatroomId, userId } = req.params;
        const { role } = req.body;
        const currentUserId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.userId;
        if (!currentUserId) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (!['admin', 'moderator', 'member'].includes(role)) {
            return next(createHttpError(400, 'Invalid role'));
        }
        // Check if current user is admin of the chatroom
        const membership = await dbconfig_1.db
            .select()
            .from(schema_1.chatroom_members)
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${currentUserId} AND ${schema_1.chatroom_members.role} = 'admin' AND ${schema_1.chatroom_members.status} = 'active'`)
            .limit(1);
        if (membership.length === 0) {
            return next(createHttpError(403, 'You must be an admin of this chatroom to change roles'));
        }
        // Can't change your own role
        if (userId === currentUserId) {
            return next(createHttpError(400, 'You cannot change your own role'));
        }
        // Update member role
        const [updated] = await dbconfig_1.db
            .update(schema_1.chatroom_members)
            .set({ role: role })
            .where((0, drizzle_orm_1.sql) `${schema_1.chatroom_members.chatroom_id} = ${chatroomId} AND ${schema_1.chatroom_members.user_id} = ${userId} AND ${schema_1.chatroom_members.status} = 'active'`)
            .returning();
        if (!updated) {
            return next(createHttpError(404, 'Member not found'));
        }
        res.status(200).json({ message: 'Member role updated successfully' });
    }
    catch (err) {
        next(err);
    }
};
exports.changeMemberRole = changeMemberRole;
