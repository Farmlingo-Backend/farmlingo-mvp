"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCoursesAdmin = exports.deleteCourse = exports.updateCourse = exports.getCourseById = exports.createCourse = exports.getCourses = void 0;
const courses_service_1 = require("../services/courses.service");
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
        const result = await courses_service_1.courseService.getCourses(page, limit);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.getCourses = getCourses;
const createCourse = async (req, res, next) => {
    try {
        const body = req.body;
        // Basic validation could be moved to service or keep here as controller concern
        if (!body.title) {
            return next(createHttpError(400, "Title is required"));
        }
        const created = await courses_service_1.courseService.createCourse({
            title: body.title,
            description: body.description,
            category: body.category,
            language: body.language,
            thumbnail_url: body.thumbnail_url,
            status: body.status,
            creator_id: body.creator_id,
        });
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
        const course = await courses_service_1.courseService.getCourseById(courseId);
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
        const updated = await courses_service_1.courseService.updateCourse(courseId, {
            title: body.title,
            description: body.description,
            category: body.category,
            language: body.language,
            thumbnail_url: body.thumbnail_url,
            status: body.status,
        });
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
        const deleted = await courses_service_1.courseService.deleteCourse(courseId);
        if (!deleted)
            return next(createHttpError(404, 'Course not found'));
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteCourse = deleteCourse;
// Admin endpoints for managing courses
const getAllCoursesAdmin = async (req, res, next) => {
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
        const result = await courses_service_1.courseService.getCourses(page, limit);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.getAllCoursesAdmin = getAllCoursesAdmin;
