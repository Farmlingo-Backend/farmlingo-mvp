"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteLesson = exports.updateLesson = exports.getLessonById = exports.createLesson = exports.getLessons = void 0;
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
const getLessons = async (req, res, next) => {
    var _a, _b;
    try {
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10, 1);
        const offset = (page - 1) * limit;
        const courseId = req.query.courseId || undefined;
        let rows;
        if (courseId) {
            rows = await dbconfig_1.db.select().from(schema_1.lessons).where((0, drizzle_orm_1.eq)(schema_1.lessons.course_id, courseId)).limit(limit).offset(offset);
        }
        else {
            rows = await dbconfig_1.db.select().from(schema_1.lessons).limit(limit).offset(offset);
        }
        res.status(200).json({ data: rows, pagination: { page, limit } });
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
        const [created] = await dbconfig_1.db
            .insert(schema_1.lessons)
            .values({
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
        })
            .returning();
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
        const rows = await dbconfig_1.db.select().from(schema_1.lessons).where((0, drizzle_orm_1.eq)(schema_1.lessons.lesson_id, lessonId)).limit(1);
        const lesson = rows[0];
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
        const [updated] = await dbconfig_1.db
            .update(schema_1.lessons)
            .set({
            title: body.title,
            description: body.description,
            category: body.category,
            duration_minutes: toNumber(body.duration_minutes),
            order_number: toNumber(body.order_number),
            is_mandatory: body.is_mandatory,
            metadata: metadata,
            status: body.status,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.lessons.lesson_id, lessonId))
            .returning();
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
        const result = await dbconfig_1.db.delete(schema_1.lessons).where((0, drizzle_orm_1.eq)(schema_1.lessons.lesson_id, lessonId)).returning();
        if (result.length === 0)
            return next(createHttpError(404, 'Lesson not found'));
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteLesson = deleteLesson;
