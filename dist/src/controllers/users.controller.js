"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = exports.getUserDashboard = exports.getUserProfile = exports.loginUser = exports.registerUser = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const drizzle_orm_1 = require("drizzle-orm");
const dbconfig_1 = require("../db/dbconfig");
const schema_1 = require("../db/schema");
const config_1 = require("../config/config");
const createHttpError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};
const allowedRoles = ['student', 'farmer', 'admin', 'super_admin'];
const registerUser = async (req, res, next) => {
    try {
        const { clerk_user_id, email, first_name, last_name, role, location_id, preferences } = req.body;
        let parsedPreferences = undefined;
        if (typeof preferences === 'string') {
            try {
                parsedPreferences = preferences ? JSON.parse(preferences) : undefined;
            }
            catch {
                return next(createHttpError(400, 'Invalid preferences JSON'));
            }
        }
        else {
            parsedPreferences = preferences;
        }
        if (!email) {
            return next(createHttpError(400, 'Email is required'));
        }
        if (role && !allowedRoles.includes(role)) {
            return next(createHttpError(400, 'Invalid role'));
        }
        const existingByEmail = await dbconfig_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
            .limit(1);
        if (existingByEmail.length > 0) {
            return next(createHttpError(409, 'Email is already registered'));
        }
        if (clerk_user_id) {
            const existingByClerk = await dbconfig_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.clerk_user_id, clerk_user_id))
                .limit(1);
            if (existingByClerk.length > 0) {
                return next(createHttpError(409, 'clerk_user_id is already registered'));
            }
        }
        const [created] = await dbconfig_1.db
            .insert(schema_1.users)
            .values({
            clerk_user_id,
            email,
            first_name,
            last_name,
            role: role,
            location_id,
            preferences: parsedPreferences
        })
            .returning();
        const { password_hash, ...safeUser } = created;
        res.status(201).json(safeUser);
    }
    catch (err) {
        next(err);
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res, next) => {
    try {
        const { clerk_user_id, email } = req.body;
        if (!clerk_user_id && !email) {
            return next(createHttpError(400, 'Either clerk_user_id or email must be provided'));
        }
        let query;
        if (clerk_user_id) {
            query = dbconfig_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.clerk_user_id, clerk_user_id))
                .limit(1);
        }
        else {
            query = dbconfig_1.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, email))
                .limit(1);
        }
        const result = await query;
        const user = result[0];
        if (!user) {
            return next(createHttpError(401, 'Invalid credentials'));
        }
        if (!user.is_active) {
            return next(createHttpError(403, 'User account is inactive'));
        }
        // Password verification removed; relies on external identity provider or other checks
        const payload = {
            sub: user.user_id,
            role: user.role,
            email: user.email,
            clerk_user_id: user.clerk_user_id
        };
        const token = jsonwebtoken_1.default.sign(payload, config_1.jwtSecret, {
            expiresIn: config_1.jwtExpiresIn
        });
        const { password_hash, ...safeUser } = user;
        res.status(200).json({
            access_token: token,
            token_type: 'Bearer',
            user: safeUser
        });
    }
    catch (err) {
        next(err);
    }
};
exports.loginUser = loginUser;
const getUserProfile = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return next(createHttpError(400, 'user_id is required'));
        }
        const auth = req.auth;
        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (auth.userId !== userId && auth.role !== 'admin' && auth.role !== 'super_admin') {
            return next(createHttpError(403, 'Forbidden'));
        }
        const rows = await dbconfig_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId))
            .limit(1);
        const user = rows[0];
        if (!user) {
            return next(createHttpError(404, 'User not found'));
        }
        const { password_hash, ...safeUser } = user;
        res.status(200).json(safeUser);
    }
    catch (err) {
        next(err);
    }
};
exports.getUserProfile = getUserProfile;
const getUserDashboard = async (req, res, next) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return next(createHttpError(400, 'user_id is required'));
        }
        const auth = req.auth;
        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (auth.userId !== userId && auth.role !== 'admin' && auth.role !== 'super_admin') {
            return next(createHttpError(403, 'Forbidden'));
        }
        const rows = await dbconfig_1.db
            .select()
            .from(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId))
            .limit(1);
        const user = rows[0];
        if (!user) {
            return next(createHttpError(404, 'User not found'));
        }
        const { password_hash, ...safeUser } = user;
        res.status(200).json({
            user: safeUser,
            dashboard: {
                message: 'User dashboard data not yet implemented'
            }
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getUserDashboard = getUserDashboard;
const getUsers = async (req, res, next) => {
    try {
        const auth = req.auth;
        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (auth.role !== 'admin' && auth.role !== 'super_admin') {
            return next(createHttpError(403, 'Forbidden'));
        }
        const allUsers = await dbconfig_1.db.select().from(schema_1.users).limit(100);
        const safeUsers = allUsers.map((u) => {
            const { password_hash, ...rest } = u;
            return rest;
        });
        res.status(200).json({ users: safeUsers });
    }
    catch (err) {
        next(err);
    }
};
exports.getUsers = getUsers;
