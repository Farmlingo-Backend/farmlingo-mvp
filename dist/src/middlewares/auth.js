"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
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
            role: payload.role,
            email: (_a = payload.email) !== null && _a !== void 0 ? _a : user.email,
            clerk_user_id: (_c = (_b = payload.clerk_user_id) !== null && _b !== void 0 ? _b : user.clerk_user_id) !== null && _c !== void 0 ? _c : null
        };
        return next();
    }
    catch (err) {
        return next(err);
    }
};
exports.authenticate = authenticate;
