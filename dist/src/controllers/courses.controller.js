"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCourse = exports.updateCourse = exports.getCourseById = exports.createCourse = exports.getCourses = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const dbconfig_1 = require("../db/dbconfig");
const schema_1 = require("../db/schema");
const createHttpError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};
const getCourses = async (req, res, next) => {
    var _a, _b;
    try {
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10, 1);
        const offset = (page - 1) * limit;
        const rows = await dbconfig_1.db.select().from(schema_1.courses).limit(limit).offset(offset);
        res.status(200).json({ data: rows, pagination: { page, limit } });
    }
    catch (err) {
        next(err);
    }
};
exports.getCourses = getCourses;
const createCourse = async (req, res, next) => {
    try {
        const body = req.body;
        const [created] = await dbconfig_1.db
            .insert(schema_1.courses)
            .values({
            title: body.title,
            description: body.description,
            category: body.category,
            language: body.language,
            thumbnail_url: body.thumbnail_url,
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
exports.createCourse = createCourse;
const getCourseById = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const rows = await dbconfig_1.db.select().from(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, courseId)).limit(1);
        const course = rows[0];
        if (!course)
            return next(createHttpError(404, 'Course not found'));
        res.status(200).json(course);
    }
    catch (err) {
        next(err);
    }
};
exports.getCourseById = getCourseById;
const updateCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const body = req.body;
        const [updated] = await dbconfig_1.db
            .update(schema_1.courses)
            .set({
            title: body.title,
            description: body.description,
            category: body.category,
            language: body.language,
            thumbnail_url: body.thumbnail_url,
            status: body.status,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, courseId))
            .returning();
        if (!updated)
            return next(createHttpError(404, 'Course not found'));
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateCourse = updateCourse;
const deleteCourse = async (req, res, next) => {
    try {
        const { courseId } = req.params;
        const result = await dbconfig_1.db.delete(schema_1.courses).where((0, drizzle_orm_1.eq)(schema_1.courses.course_id, courseId)).returning();
        if (result.length === 0)
            return next(createHttpError(404, 'Course not found'));
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCourse = deleteCourse;
