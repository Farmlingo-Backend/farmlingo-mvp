import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

import { jwtSecret } from '../config/config';
import { db } from '../db/dbconfig';
import { users } from '../db/schema';
import { AuthContext, Role } from '../types/rbac-comprehensive';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

/**
 * Legacy JWT authentication middleware
 * @deprecated Use Clerk authentication instead
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization || '';

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createHttpError(401, 'Missing or invalid Authorization header'));
    }

    const token = authHeader.slice(7).trim();

    let payload: (JwtPayload & { sub?: string; role?: string; email?: string; clerk_user_id?: string }) | null = null;

    try {
      payload = jwt.verify(token, jwtSecret) as JwtPayload & {
        sub?: string;
        role?: string;
        email?: string;
        clerk_user_id?: string;
      };
    } catch (err) {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    if (!payload?.sub) {
      return next(createHttpError(401, 'Invalid token payload'));
    }

    const userId = payload.sub as string;

    const rows = await db
      .select()
      .from(users)
      .where(eq(users.user_id, userId))
      .limit(1);

    const user = rows[0];

    if (!user) {
      return next(createHttpError(401, 'User not found for token'));
    }

    if (!user.is_active) {
      return next(createHttpError(403, 'User account is inactive'));
    }

    (req as any).auth = {
      userId,
      role: (payload.role as Role) || user.role,
      institutionId: user.institution_id,
      email: payload.email ?? user.email,
      clerkUserId: payload.clerk_user_id ?? user.clerk_user_id ?? null
    } as AuthContext;

    return next();
  } catch (err) {
    return next(err as Error);
  }
};

/**
 * Enhanced role-based authorization middleware with RBAC support
 */
export const requireRole = (requiredRoles: Role | Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = (req as any).auth as AuthContext;

    if (!auth) {
      return next(createHttpError(401, 'Authentication required'));
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    if (!roles.includes(auth.role as Role)) {
      return next(createHttpError(403, `Insufficient permissions. Required: ${roles.join(', ')}, Got: ${auth.role}`));
    }

    return next();
  };
};

/**
 * Admin-only authorization middleware
 */
export const requireAdmin = requireRole(['super_admin']);

/**
 * Super admin only authorization middleware
 */
export const requireSuperAdmin = requireRole(['super_admin']);

/**
 * Institution Admin authorization middleware
 */
export const requireInstitutionAdmin = requireRole(['institution_admin', 'super_admin']);

/**
 * Instructor authorization middleware
 */
export const requireInstructor = requireRole(['instructor', 'institution_admin', 'super_admin']);

/**
 * Learner (Student/Farmer) authorization middleware
 */
export const requireLearner = requireRole(['student', 'farmer']);

/**
 * Middleware to ensure user belongs to an institution (for institution-scoped operations)
 */
export const requireInstitutionMembership = (req: Request, res: Response, next: NextFunction): void => {
  const auth = (req as any).auth as AuthContext;

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
