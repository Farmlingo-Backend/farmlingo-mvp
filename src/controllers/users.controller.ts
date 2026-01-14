/// <reference path="../types/express.d.ts" />

import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';

import { db } from '../db/dbconfig';
import { users, system_logs } from '../db/schema';

import { userService } from '../services/users.service';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};



// registerUser and loginUser removed as authentication is now managed by Clerk.

export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.user_id, userId))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }

    res.status(200).json(user);
  } catch (err) {
    next(err as Error);
  }
};

export const getUserDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.user_id, userId))
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
  } catch (err) {
    next(err as Error);
  }
};

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = req.auth;

    if (!auth) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (auth.role !== 'admin' && auth.role !== 'super_admin') {
      return next(createHttpError(403, 'Forbidden'));
    }

    const allUsers = await db.select().from(users).limit(100);
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
  } catch (err) {
    next(err as Error);
  }
};

/**
 * Sync Clerk user profile from webhook
 * Called by Clerk webhooks to create or update user data
 */


/**
 * Get authenticated user profile
 * Returns the profile of the currently authenticated user using Clerk
 */
export const getAuthenticatedUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get Clerk user ID from request (set by clerkAuth middleware)
    const clerkAuth = req.clerkAuth;

    if (!clerkAuth?.clerkUserId) {
      return next(createHttpError(401, 'Unauthorized - No Clerk authentication found'));
    }

    const user = await userService.getAuthenticatedUser(clerkAuth.clerkUserId);

    // Remove sensitive data
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Sync authenticated user (Called from frontend after login)
 * Updates user profile ensuring backend is in sync with Clerk
 */
export const syncUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const clerkAuth = req.clerkAuth;

    if (!clerkAuth || !clerkAuth.clerkUserId) {
      return next(createHttpError(401, 'Unauthorized - No Clerk authentication found'));
    }

    // Lazy Sync: Fetch data securely from Clerk instead of trusting req.body
    // This ensures we always have the latest data and don't rely on frontend
    const user = await userService.syncUserFromClerk(clerkAuth.clerkUserId);

    res.status(200).json({
      success: true,
      message: 'User synced successfully',
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// Admin User Management Functions
export const suspendUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const [updatedUser] = await db
      .update(users)
      .set({
        is_active: false,
        updated_at: new Date()
      })
      .where(eq(users.user_id, userId))
      .returning();

    if (!updatedUser) {
      return next(createHttpError(404, 'User not found'));
    }

    // Log the action
    await db.insert(system_logs).values({
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
  } catch (err) {
    next(err as Error);
  }
};

export const activateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const [updatedUser] = await db
      .update(users)
      .set({
        is_active: true,
        updated_at: new Date()
      })
      .where(eq(users.user_id, userId))
      .returning();

    if (!updatedUser) {
      return next(createHttpError(404, 'User not found'));
    }

    // Log the action
    await db.insert(system_logs).values({
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
  } catch (err) {
    next(err as Error);
  }
};

export const changeUserRole = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    await db.insert(system_logs).values({
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
  } catch (err) {
    next(err as Error);
  }
};

export const deleteUserAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
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
    const deletedUser = await db
      .delete(users)
      .where(eq(users.user_id, userId))
      .returning();

    if (deletedUser.length === 0) {
      return next(createHttpError(404, 'User not found'));
    }

    // Log the action
    await db.insert(system_logs).values({
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
  } catch (err) {
    next(err as Error);
  }
};
