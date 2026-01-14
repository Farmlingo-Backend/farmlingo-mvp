"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllForumsAdmin = exports.createForumPost = exports.getForumPosts = exports.deleteForum = exports.updateForum = exports.getForumById = exports.createForum = exports.getForums = void 0;
const forums_service_1 = require("../services/forums.service");
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
        const result = await forums_service_1.forumService.getForums(page, limit);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.getForums = getForums;
const createForum = async (req, res, next) => {
    try {
        const body = req.body;
        if (!body.name || !body.slug) {
            return next(createHttpError(400, "Name and Slug are required"));
        }
        const created = await forums_service_1.forumService.createForum({
            name: body.name,
            description: body.description,
            slug: body.slug,
            category: body.category,
            is_active: toBoolean(body.is_active),
            display_order: toNumber(body.display_order),
        });
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
        const forum = await forums_service_1.forumService.getForumById(forumId);
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
        const updated = await forums_service_1.forumService.updateForum(forumId, {
            name: body.name,
            description: body.description,
            slug: body.slug,
            category: body.category,
            is_active: toBoolean(body.is_active),
            display_order: toNumber(body.display_order),
        });
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
        const deleted = await forums_service_1.forumService.deleteForum(forumId);
        if (!deleted)
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
        const result = await forums_service_1.forumService.getForumPosts(forumId, page, limit);
        res.status(200).json(result);
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
        const created = await forums_service_1.forumService.createForumPost({
            forum_id: forumId,
            user_id: req.auth.userId,
            title: body.title,
            content: body.content,
            tags: tags,
        });
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createForumPost = createForumPost;
// Admin endpoints for managing forums
const getAllForumsAdmin = async (req, res, next) => {
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
        const result = await forums_service_1.forumService.getForums(page, limit);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.getAllForumsAdmin = getAllForumsAdmin;
