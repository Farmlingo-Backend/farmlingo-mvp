"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteEnrollment = exports.updateEnrollment = exports.getEnrollmentById = exports.createEnrollment = exports.getEnrollments = void 0;
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
const getEnrollments = async (req, res, next) => {
    var _a, _b;
    try {
        const page = Math.max(parseInt(String((_a = req.query.page) !== null && _a !== void 0 ? _a : '1'), 10) || 1, 1);
        const limit = Math.max(parseInt(String((_b = req.query.limit) !== null && _b !== void 0 ? _b : '10'), 10) || 10, 1);
        const offset = (page - 1) * limit;
        const userId = req.query.userId || undefined;
        const courseId = req.query.courseId || undefined;
        let rows;
        if (userId && courseId) {
            rows = await dbconfig_1.db
                .select()
                .from(schema_1.course_enrollments)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.course_enrollments.user_id, userId), (0, drizzle_orm_1.eq)(schema_1.course_enrollments.course_id, courseId)))
                .limit(limit)
                .offset(offset);
        }
        else if (userId) {
            rows = await dbconfig_1.db
                .select()
                .from(schema_1.course_enrollments)
                .where((0, drizzle_orm_1.eq)(schema_1.course_enrollments.user_id, userId))
                .limit(limit)
                .offset(offset);
        }
        else if (courseId) {
            rows = await dbconfig_1.db
                .select()
                .from(schema_1.course_enrollments)
                .where((0, drizzle_orm_1.eq)(schema_1.course_enrollments.course_id, courseId))
                .limit(limit)
                .offset(offset);
        }
        else {
            rows = await dbconfig_1.db.select().from(schema_1.course_enrollments).limit(limit).offset(offset);
        }
        res.status(200).json({ data: rows, pagination: { page, limit } });
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
        const [created] = await dbconfig_1.db
            .insert(schema_1.course_enrollments)
            .values({
            user_id: body.user_id,
            course_id: body.course_id,
            enrollment_status: body.enrollment_status,
            preferences: preferences,
        })
            .returning();
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
        const rows = await dbconfig_1.db.select().from(schema_1.course_enrollments).where((0, drizzle_orm_1.eq)(schema_1.course_enrollments.enrollment_id, enrollmentId)).limit(1);
        const enrollment = rows[0];
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
        const [updated] = await dbconfig_1.db
            .update(schema_1.course_enrollments)
            .set({
            progress_percentage: toNumber(progress_percentage),
            enrollment_status: status,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.course_enrollments.enrollment_id, enrollmentId))
            .returning();
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
        const result = await dbconfig_1.db.delete(schema_1.course_enrollments).where((0, drizzle_orm_1.eq)(schema_1.course_enrollments.enrollment_id, enrollmentId)).returning();
        if (result.length === 0)
            return next(createHttpError(404, 'Enrollment not found'));
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
};
exports.deleteEnrollment = deleteEnrollment;
