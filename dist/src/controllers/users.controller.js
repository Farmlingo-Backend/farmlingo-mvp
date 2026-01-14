"use strict";
/// <reference path="../types/express.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAdmin = exports.changeUserRole = exports.activateUser = exports.suspendUser = exports.syncUser = exports.getAuthenticatedUserProfile = exports.getUsers = exports.getUserDashboard = exports.getUserProfile = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const dbconfig_1 = require("../db/dbconfig");
const schema_1 = require("../db/schema");
const users_service_1 = require("../services/users.service");
const createHttpError = (status, message) => {
    const err = new Error(message);
    err.status = status;
    return err;
};
// registerUser and loginUser removed as authentication is now managed by Clerk.
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
        res.status(200).json(user);
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
        res.status(200).json({
            user: user,
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
        // Remove sensitive data for admin view
        const safeUsers = allUsers.map((user) => ({
            user_id: user.user_id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            image_url: user.image_url,
            created_at: user.created_at,
            is_active: user.is_active
        }));
        res.status(200).json({ users: safeUsers });
    }
    catch (err) {
        next(err);
    }
};
exports.getUsers = getUsers;
/**
 * Sync Clerk user profile from webhook
 * Called by Clerk webhooks to create or update user data
 */
/**
 * Get authenticated user profile
 * Returns the profile of the currently authenticated user using Clerk
 */
const getAuthenticatedUserProfile = async (req, res, next) => {
    try {
        // Get Clerk user ID from request (set by clerkAuth middleware)
        const clerkAuth = req.clerkAuth;
        if (!(clerkAuth === null || clerkAuth === void 0 ? void 0 : clerkAuth.clerkUserId)) {
            return next(createHttpError(401, 'Unauthorized - No Clerk authentication found'));
        }
        const user = await users_service_1.userService.getAuthenticatedUser(clerkAuth.clerkUserId);
        // Remove sensitive data
        res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (err) {
        next(err);
    }
};
exports.getAuthenticatedUserProfile = getAuthenticatedUserProfile;
/**
 * Sync authenticated user (Called from frontend after login)
 * Updates user profile ensuring backend is in sync with Clerk
 */
const syncUser = async (req, res, next) => {
    try {
        const clerkAuth = req.clerkAuth;
        if (!clerkAuth || !clerkAuth.clerkUserId) {
            return next(createHttpError(401, 'Unauthorized - No Clerk authentication found'));
        }
        // Lazy Sync: Fetch data securely from Clerk instead of trusting req.body
        // This ensures we always have the latest data and don't rely on frontend
        const user = await users_service_1.userService.syncUserFromClerk(clerkAuth.clerkUserId);
        res.status(200).json({
            success: true,
            message: 'User synced successfully',
            data: user
        });
    }
    catch (err) {
        next(err);
    }
};
exports.syncUser = syncUser;
// Admin User Management Functions
const suspendUser = async (req, res, next) => {
    try {
        const auth = req.auth;
        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (auth.role !== 'admin' && auth.role !== 'super_admin') {
            return next(createHttpError(403, 'Forbidden: Admin access required'));
        }
        const { userId } = req.params;
        const { reason } = req.body;
        if (!userId) {
            return next(createHttpError(400, 'User ID is required'));
        }
        // Update user status
        const [updatedUser] = await dbconfig_1.db
            .update(schema_1.users)
            .set({
            is_active: false,
            updated_at: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId))
            .returning();
        if (!updatedUser) {
            return next(createHttpError(404, 'User not found'));
        }
        // Log the action
        await dbconfig_1.db.insert(schema_1.system_logs).values({
            user_id: auth.userId,
            action_type: 'admin_action',
            module: 'admin',
            description: `User ${userId} suspended`,
            metadata: { reason, suspended_by: auth.userId }
        });
        res.status(200).json({
            success: true,
            message: 'User suspended successfully',
            user: updatedUser
        });
    }
    catch (err) {
        next(err);
    }
};
exports.suspendUser = suspendUser;
const activateUser = async (req, res, next) => {
    try {
        const auth = req.auth;
        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (auth.role !== 'admin' && auth.role !== 'super_admin') {
            return next(createHttpError(403, 'Forbidden: Admin access required'));
        }
        const { userId } = req.params;
        if (!userId) {
            return next(createHttpError(400, 'User ID is required'));
        }
        // Update user status
        const [updatedUser] = await dbconfig_1.db
            .update(schema_1.users)
            .set({
            is_active: true,
            updated_at: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId))
            .returning();
        if (!updatedUser) {
            return next(createHttpError(404, 'User not found'));
        }
        // Log the action
        await dbconfig_1.db.insert(schema_1.system_logs).values({
            user_id: auth.userId,
            action_type: 'admin_action',
            module: 'admin',
            description: `User ${userId} activated`,
            metadata: { activated_by: auth.userId }
        });
        res.status(200).json({
            success: true,
            message: 'User activated successfully',
            user: updatedUser
        });
    }
    catch (err) {
        next(err);
    }
};
exports.activateUser = activateUser;
const changeUserRole = async (req, res, next) => {
    try {
        const auth = req.auth;
        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (auth.role !== 'super_admin') {
            return next(createHttpError(403, 'Forbidden: Super admin access required - Role changes must be done in Clerk'));
        }
        const { userId } = req.params;
        const { role } = req.body;
        if (!userId) {
            return next(createHttpError(400, 'User ID is required'));
        }
        if (!role || !['student', 'farmer', 'admin', 'super_admin'].includes(role)) {
            return next(createHttpError(400, 'Valid role is required'));
        }
        // Prevent changing own role
        if (userId === auth.userId) {
            return next(createHttpError(400, 'Cannot change your own role'));
        }
        // Note: User roles are managed by Clerk, not stored in our database
        // This endpoint serves as a placeholder for role management
        // Actual role changes should be performed in the Clerk dashboard
        // Log the action (role changes would need to be synced from Clerk)
        await dbconfig_1.db.insert(schema_1.system_logs).values({
            user_id: auth.userId,
            action_type: 'admin_action',
            module: 'admin',
            description: `Requested role change for user ${userId} to ${role} - Must be done in Clerk`,
            metadata: { requested_role: role, requested_by: auth.userId, note: 'Role changes managed by Clerk' }
        });
        res.status(200).json({
            success: true,
            message: 'Role change request logged. Please update user role in Clerk dashboard.',
            note: 'User roles are managed by Clerk authentication service, not stored in the database.',
            userId: userId,
            requestedRole: role
        });
    }
    catch (err) {
        next(err);
    }
};
exports.changeUserRole = changeUserRole;
const deleteUserAdmin = async (req, res, next) => {
    try {
        const auth = req.auth;
        if (!auth) {
            return next(createHttpError(401, 'Unauthorized'));
        }
        if (auth.role !== 'super_admin') {
            return next(createHttpError(403, 'Forbidden: Super admin access required'));
        }
        const { userId } = req.params;
        const { reason } = req.body;
        if (!userId) {
            return next(createHttpError(400, 'User ID is required'));
        }
        // Prevent deleting own account
        if (userId === auth.userId) {
            return next(createHttpError(400, 'Cannot delete your own account'));
        }
        // Hard delete user (use with caution)
        const deletedUser = await dbconfig_1.db
            .delete(schema_1.users)
            .where((0, drizzle_orm_1.eq)(schema_1.users.user_id, userId))
            .returning();
        if (deletedUser.length === 0) {
            return next(createHttpError(404, 'User not found'));
        }
        // Log the action
        await dbconfig_1.db.insert(schema_1.system_logs).values({
            user_id: auth.userId,
            action_type: 'user_delete',
            module: 'admin',
            description: `User ${userId} permanently deleted`,
            metadata: { reason, deleted_by: auth.userId }
        });
        res.status(200).json({
            success: true,
            message: 'User permanently deleted',
            deletedUser: deletedUser[0]
        });
    }
    catch (err) {
        next(err);
    }
};
exports.deleteUserAdmin = deleteUserAdmin;
