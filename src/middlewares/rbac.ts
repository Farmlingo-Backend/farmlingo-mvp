import { Request, Response, NextFunction } from 'express';
import { rbac, RBACError, InsufficientPermissionsError, InstitutionAccessError, AuthContext, RBACMiddlewareOptions } from '../types/rbac-comprehensive';
import { eq } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { users } from '../db/schema';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

/**
 * RBAC Middleware Factory
 * Creates middleware that enforces role-based access control
 */
export const requirePermission = (options: RBACMiddlewareOptions) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get auth context from request (set by authentication middleware)
      const auth = (req as any).auth as AuthContext;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      const { module, action, requireInstitutionAccess = false } = options;

      // Check basic permission
      if (!rbac.hasPermission(auth.role as any, module, action)) {
        return next(new InsufficientPermissionsError(module, action, auth.role as any));
      }

      // Check institution access if required
      if (requireInstitutionAccess && auth.role !== 'super_admin') {
        // For institution-scoped operations, we need to validate institution access
        // This will be handled by specific middleware that checks resource ownership
        (req as any).rbacContext = {
          module,
          action,
          requireInstitutionAccess: true
        };
      }

      // Add RBAC context to request for use in controllers
      (req as any).rbacContext = {
        module,
        action,
        requireInstitutionAccess
      };

      next();
    } catch (err) {
      if (err instanceof RBACError) {
        return next(createHttpError(err.statusCode, err.message));
      }
      next(err as Error);
    }
  };
};

/**
 * Middleware to check if user can access a specific resource based on institution
 */
export const checkResourceAccess = (getResourceInstitutionId: (req: Request) => string | null | undefined) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const auth = (req as any).auth as AuthContext;
      const rbacContext = (req as any).rbacContext;

      if (!auth || !rbacContext?.requireInstitutionAccess) {
        return next();
      }

      const resourceInstitutionId = getResourceInstitutionId(req);

      // Super Admin can access all resources
      if (auth.role === 'super_admin') {
        return next();
      }

      // Check if user can access this resource's institution
      if (!rbac.canAccessResource(auth.role as any, auth.institutionId, resourceInstitutionId)) {
        return next(new InstitutionAccessError());
      }

      next();
    } catch (err) {
      if (err instanceof RBACError) {
        return next(createHttpError(err.statusCode, err.message));
      }
      next(err as Error);
    }
  };
};

/**
 * Middleware to validate user can manage their own institution resources
 */
export const requireOwnInstitution = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const auth = (req as any).auth as AuthContext;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      // Super Admin can manage all institutions
      if (auth.role === 'super_admin') {
        return next();
      }

      // Other roles can only manage their own institution
      if (!auth.institutionId) {
        return next(createHttpError(403, 'Access denied: User must belong to an institution'));
      }

      (req as any).userInstitutionId = auth.institutionId;
      next();
    } catch (err) {
      next(err as Error);
    }
  };
};

/**
 * Middleware to validate Super Admin access
 */
export const requireSuperAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const auth = (req as any).auth as AuthContext;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      if (auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      next();
    } catch (err) {
      next(err as Error);
    }
  };
};

/**
 * Middleware to validate Institution Admin access
 */
export const requireInstitutionAdmin = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const auth = (req as any).auth as AuthContext;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      if (auth.role !== 'institution_admin' && auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Institution admin access required'));
      }

      next();
    } catch (err) {
      next(err as Error);
    }
  };
};

/**
 * Middleware to validate Instructor access
 */
export const requireInstructor = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const auth = (req as any).auth as AuthContext;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      const allowedRoles = ['instructor', 'institution_admin', 'super_admin'];
      if (!allowedRoles.includes(auth.role)) {
        return next(createHttpError(403, 'Instructor access required'));
      }

      next();
    } catch (err) {
      next(err as Error);
    }
  };
};

/**
 * Middleware to validate Student/Farmer access
 */
export const requireLearner = () => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const auth = (req as any).auth as AuthContext;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      const allowedRoles = ['student', 'farmer'];
      if (!allowedRoles.includes(auth.role)) {
        return next(createHttpError(403, 'Learner access required'));
      }

      next();
    } catch (err) {
      next(err as Error);
    }
  };
};

/**
 * Utility function to get user's institution ID from database
 */
export const getUserInstitutionId = async (userId: string): Promise<string | null> => {
  try {
    const [user] = await db
      .select({ institutionId: users.institution_id })
      .from(users)
      .where(eq(users.user_id, userId))
      .limit(1);

    return user?.institutionId || null;
  } catch (err) {
    console.error('Error fetching user institution:', err);
    return null;
  }
};

/**
 * Utility function to check if user belongs to same institution as resource
 */
export const validateInstitutionOwnership = async (
  userId: string, 
  resourceInstitutionId: string | null | undefined
): Promise<boolean> => {
  if (!resourceInstitutionId) {
    return true; // Public resources or Super Admin resources
  }

  const userInstitutionId = await getUserInstitutionId(userId);
  return userInstitutionId === resourceInstitutionId;
};