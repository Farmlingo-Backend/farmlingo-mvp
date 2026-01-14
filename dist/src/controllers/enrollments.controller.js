"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEnrollmentsAdmin = exports.deleteEnrollment = exports.updateEnrollment = exports.getEnrollmentById = exports.createEnrollment = exports.getEnrollments = void 0;
const enrollments_service_1 = require("../services/enrollments.service");
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
const getEnrollments = async (req, res, next) => {
    var _a, _b;
    try {
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10, 1);
        const userId = req.query.userId || undefined;
        const courseId = req.query.courseId || undefined;
        const result = await enrollments_service_1.enrollmentService.getEnrollments(page, limit, userId, courseId);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.getEnrollments = getEnrollments;
const createEnrollment = async (req, res, next) => {
    try {
        const body = req.body;
        let preferences = body.preferences;
        if (typeof preferences === 'string') {
            try {
                preferences = preferences ? JSON.parse(preferences) : undefined;
            }
            catch {
                return next(createHttpError(400, 'Invalid preferences JSON'));
            }
        }
        if (!body.course_id) {
            return next(createHttpError(400, "Course ID is required"));
        }
        const created = await enrollments_service_1.enrollmentService.createEnrollment({
            user_id: req.auth.userId,
            course_id: body.course_id,
            enrollment_status: body.enrollment_status,
            preferences: preferences,
        });
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
};
exports.createEnrollment = createEnrollment;
const getEnrollmentById = async (req, res, next) => {
    try {
        const { enrollmentId } = req.params;
        const enrollment = await enrollments_service_1.enrollmentService.getEnrollmentById(enrollmentId);
        if (!enrollment)
            return next(createHttpError(404, 'Enrollment not found'));
        res.status(200).json(enrollment);
    }
    catch (err) {
        next(err);
    }
};
exports.getEnrollmentById = getEnrollmentById;
const updateEnrollment = async (req, res, next) => {
    try {
        const { enrollmentId } = req.params;
        const { progress_percentage, status } = req.body;
        const updated = await enrollments_service_1.enrollmentService.updateEnrollment(enrollmentId, {
            progress_percentage: toNumber(progress_percentage),
            enrollment_status: status,
        });
        if (!updated)
            return next(createHttpError(404, 'Enrollment not found'));
        res.status(200).json(updated);
    }
    catch (err) {
        next(err);
    }
};
exports.updateEnrollment = updateEnrollment;
const deleteEnrollment = async (req, res, next) => {
    try {
        const { enrollmentId } = req.params;
        const deleted = await enrollments_service_1.enrollmentService.deleteEnrollment(enrollmentId);
        if (!deleted)
            return next(createHttpError(404, 'Enrollment not found'));
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEnrollment = deleteEnrollment;
// Admin endpoints for managing enrollments
const getAllEnrollmentsAdmin = async (req, res, next) => {
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
        const userId = req.query.userId || undefined;
        const courseId = req.query.courseId || undefined;
        const result = await enrollments_service_1.enrollmentService.getEnrollments(page, limit, userId, courseId);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.getAllEnrollmentsAdmin = getAllEnrollmentsAdmin;
