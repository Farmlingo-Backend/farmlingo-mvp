"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllChatMessagesAdmin = exports.getMessageHistory = exports.searchMessages = exports.addMessageReaction = exports.deleteChatMessage = exports.updateChatMessage = exports.getAllChatroomsAdmin = exports.createChatMessage = exports.getChatMessages = exports.deleteChatroom = exports.updateChatroom = exports.getChatroomById = exports.createChatroom = exports.getChatrooms = void 0;
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
