"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createForumPost = exports.getForumPosts = exports.deleteForum = exports.updateForum = exports.getForumById = exports.createForum = exports.getForums = void 0;
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
function toBoolean(value) {
    if (value === undefined || value === null || value === '')
        return undefined;
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'string') {
        if (value.toLowerCase() === 'true')
            return true;
        if (value.toLowerCase() === 'false')
            return false;
    }
    return undefined;
}
const getForums = async (req, res, next) => {
    var _a, _b;
    try {
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10, 1);
        const offset = (page - 1) * limit;
        const rows = await dbconfig_1.db.select().from(schema_1.forums).limit(limit).offset(offset);
        res.status(200).json({ data: rows, pagination: { page, limit } });
    }
    catch (err) {
        next(err);
    }
};
exports.getForums = getForums;
const createForum = async (req, res, next) => {
    try {
        const body = req.body;
        const [created] = await dbconfig_1.db
            .insert(schema_1.forums)
            .values({
            name: body.name,
            description: body.description,
            slug: body.slug,
            category: body.category,
            is_active: toBoolean(body.is_active),
            display_order: toNumber(body.display_order),
        })
            .returning();
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createForum = createForum;
const getForumById = async (req, res, next) => {
    try {
        const { forumId } = req.params;
        const rows = await dbconfig_1.db.select().from(schema_1.forums).where((0, drizzle_orm_1.eq)(schema_1.forums.forum_id, forumId)).limit(1);
        const forum = rows[0];
        if (!forum)
            return next(createHttpError(404, 'Forum not found'));
        res.status(200).json(forum);
    }
    catch (err) {
        next(err);
    }
};
exports.getForumById = getForumById;
const updateForum = async (req, res, next) => {
    try {
        const { forumId } = req.params;
        const body = req.body;
        const [updated] = await dbconfig_1.db
            .update(schema_1.forums)
            .set({
            name: body.name,
            description: body.description,
            slug: body.slug,
            category: body.category,
            is_active: toBoolean(body.is_active),
            display_order: toNumber(body.display_order),
        })
            .where((0, drizzle_orm_1.eq)(schema_1.forums.forum_id, forumId))
            .returning();
        if (!updated)
            return next(createHttpError(404, 'Forum not found'));
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateForum = updateForum;
const deleteForum = async (req, res, next) => {
    try {
        const { forumId } = req.params;
        const result = await dbconfig_1.db.delete(schema_1.forums).where((0, drizzle_orm_1.eq)(schema_1.forums.forum_id, forumId)).returning();
        if (result.length === 0)
            return next(createHttpError(404, 'Forum not found'));
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteForum = deleteForum;
const getForumPosts = async (req, res, next) => {
    var _a, _b;
    try {
        const { forumId } = req.params;
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10, 1);
        const offset = (page - 1) * limit;
        const rows = await dbconfig_1.db
            .select()
            .from(schema_1.forum_posts)
            .where((0, drizzle_orm_1.eq)(schema_1.forum_posts.forum_id, forumId))
            .limit(limit)
            .offset(offset);
        res.status(200).json({ data: rows, pagination: { page, limit } });
    }
    catch (err) {
        next(err);
    }
};
exports.getForumPosts = getForumPosts;
const createForumPost = async (req, res, next) => {
    try {
        const { forumId } = req.params;
        const body = req.body;
        let tags = body.tags;
        if (typeof tags === 'string') {
            try {
                tags = tags ? JSON.parse(tags) : undefined;
            }
            catch {
                return next(createHttpError(400, 'Invalid tags JSON'));
            }
        }
        const [created] = await dbconfig_1.db
            .insert(schema_1.forum_posts)
            .values({
            forum_id: forumId,
            user_id: body.user_id,
            title: body.title,
            content: body.content,
            tags: tags,
        })
            .returning();
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createForumPost = createForumPost;
