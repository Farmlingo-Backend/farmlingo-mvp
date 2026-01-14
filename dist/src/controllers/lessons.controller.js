"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllLessonsAdmin = exports.deleteLesson = exports.updateLesson = exports.getLessonById = exports.createLesson = exports.getLessons = void 0;
const lessons_service_1 = require("../services/lessons.service");
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
const getLessons = async (req, res, next) => {
    var _a, _b;
    try {
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10, 1);
        const courseId = req.query.courseId || undefined;
        const result = await lessons_service_1.lessonService.getLessons(page, limit, courseId);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.getLessons = getLessons;
const createLesson = async (req, res, next) => {
    try {
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
        if (!body.course_id || !body.title) {
            return next(createHttpError(400, "Course ID and Title are required"));
        }
        const created = await lessons_service_1.lessonService.createLesson({
            course_id: body.course_id,
            title: body.title,
            description: body.description,
            category: body.category,
            duration_minutes: toNumber(body.duration_minutes),
            order_number: toNumber(body.order_number),
            is_mandatory: body.is_mandatory,
            metadata: metadata,
            status: body.status,
            creator_id: body.creator_id,
        });
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createLesson = createLesson;
const getLessonById = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        const lesson = await lessons_service_1.lessonService.getLessonById(lessonId);
        if (!lesson)
            return next(createHttpError(404, 'Lesson not found'));
        res.status(200).json(lesson);
    }
    catch (err) {
        next(err);
    }
};
exports.getLessonById = getLessonById;
const updateLesson = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
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
        const updated = await lessons_service_1.lessonService.updateLesson(lessonId, {
            title: body.title,
            description: body.description,
            category: body.category,
            duration_minutes: toNumber(body.duration_minutes),
            order_number: toNumber(body.order_number),
            is_mandatory: body.is_mandatory,
            metadata: metadata,
            status: body.status,
        });
        if (!updated)
            return next(createHttpError(404, 'Lesson not found'));
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateLesson = updateLesson;
const deleteLesson = async (req, res, next) => {
    try {
        const { lessonId } = req.params;
        const deleted = await lessons_service_1.lessonService.deleteLesson(lessonId);
        if (!deleted)
            return next(createHttpError(404, 'Lesson not found'));
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteLesson = deleteLesson;
// Admin endpoints for managing lessons
const getAllLessonsAdmin = async (req, res, next) => {
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
        const courseId = req.query.courseId || undefined;
        const result = await lessons_service_1.lessonService.getLessons(page, limit, courseId);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.getAllLessonsAdmin = getAllLessonsAdmin;
