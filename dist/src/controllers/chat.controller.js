"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChatMessage = exports.getChatMessages = exports.deleteChatroom = exports.updateChatroom = exports.getChatroomById = exports.createChatroom = exports.getChatrooms = void 0;
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
            created_by: body.created_by,
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
            user_id: body.user_id,
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
