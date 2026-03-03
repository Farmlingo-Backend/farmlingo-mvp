"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireInstitutionMembership = exports.requireLearner = exports.requireInstructor = exports.requireInstitutionAdmin = exports.requireSuperAdmin = exports.requireAdmin = exports.requireRole = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const drizzle_orm_1 = require("drizzle-orm");
const config_1 = require("../config/config");
const dbconfig_1 = require("../db/dbconfig");
const schema_1 = require("../db/schema");
const createHttpError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};
/**
 * Legacy JWT authentication middleware
 * @deprecated Use Clerk authentication instead
 */
const authenticate = async (req, res, next) => {
    var _a, _b, _c;
    try {
        const authHeader = req.headers.authorization || '';
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next(createHttpError(401, 'Missing or invalid Authorization header'));
        }
        const token = authHeader.slice(7).trim();
        let payload = null;
        try {
            payload = jsonwebtoken_1.default.verify(token, config_1.jwtSecret);
        }
        catch (err) {
            return next(createHttpError(401, 'Invalid or expired token'));
        }
        if (!(payload === null || payload === void 0 ? void 0 : payload.sub)) {
            return next(createHttpError(401, 'Invalid token payload'));
        }
        const userId = payload.sub;
        const rows = await dbconfig_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId))
            .limit(1);
        const user = rows[0];
        if (!user) {
            return next(createHttpError(401, 'User not found for token'));
        }
        if (!user.is_active) {
            return next(createHttpError(403, 'User account is inactive'));
        }
        req.auth = {
            userId,
            role: payload.role || user.role,
            institutionId: user.institution_id,
            email: (_a = payload.email) !== null && _a !== void 0 ? _a : user.email,
            clerkUserId: (_c = (_b = payload.clerk_user_id) !== null && _b !== void 0 ? _b : user.clerk_user_id) !== null && _c !== void 0 ? _c : null
        };
        return next();
    }
    catch (err) {
        return next(err);
    }
};
exports.authenticate = authenticate;
/**
 * Enhanced role-based authorization middleware with RBAC support
 */
const requireRole = (requiredRoles) => {
    return (req, res, next) => {
        const auth = req.auth;
        if (!auth) {
            return next(createHttpError(401, 'Authentication required'));
        }
        const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        if (!roles.includes(auth.role)) {
            return next(createHttpError(403, `Insufficient permissions. Required: ${roles.join(', ')}, Got: ${auth.role}`));
        }
        return next();
    };
};
exports.requireRole = requireRole;
/**
 * Admin-only authorization middleware
 */
exports.requireAdmin = (0, exports.requireRole)(['super_admin']);
/**
 * Super admin only authorization middleware
 */
exports.requireSuperAdmin = (0, exports.requireRole)(['super_admin']);
/**
 * Institution Admin authorization middleware
 */
exports.requireInstitutionAdmin = (0, exports.requireRole)(['institution_admin', 'super_admin']);
/**
 * Instructor authorization middleware
 */
exports.requireInstructor = (0, exports.requireRole)(['instructor', 'institution_admin', 'super_admin']);
/**
 * Learner (Student/Farmer) authorization middleware
 */
exports.requireLearner = (0, exports.requireRole)(['student', 'farmer']);
/**
 * Middleware to ensure user belongs to an institution (for institution-scoped operations)
 */
const requireInstitutionMembership = (req, res, next) => {
    const auth = req.auth;
    if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
    }
    // Super Admin can access all resources
    if (auth.role === 'super_admin') {
        return next();
    }
    // Other roles must belong to an institution
    if (!auth.institutionId) {
        return next(createHttpError(403, 'Access denied: User must belong to an institution'));
    }
    return next();
};
exports.requireInstitutionMembership = requireInstitutionMembership;
