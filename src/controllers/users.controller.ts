import { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';

import { db } from '../db/dbconfig';
import { users } from '../db/schema';
import { AuthContext } from '../middlewares/auth';
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

    const auth = (req as any).auth as AuthContext | undefined;

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

    const auth = (req as any).auth as AuthContext | undefined;

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
    const auth = (req as any).auth as AuthContext | undefined;

    if (!auth) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (auth.role !== 'admin' && auth.role !== 'super_admin') {
      return next(createHttpError(403, 'Forbidden'));
    }

    const allUsers = await db.select().from(users).limit(100);
    const safeUsers = allUsers.map((u: any) => {
      return u;
    });
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
    const clerkAuth = (req as any).clerkAuth;

    if (!clerkAuth || !clerkAuth.clerkUserId) {
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
    const clerkAuth = (req as any).clerkAuth;

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
