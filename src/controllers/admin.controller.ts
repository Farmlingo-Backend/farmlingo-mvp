import { Request, Response, NextFunction } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { users, institutions } from '../db/schema';
import { AuthContext, Role } from '../types/rbac-comprehensive';
import { getUserInstitutionId } from '../middlewares/rbac';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

/**
 * Admin Controller
 * Handles Super Admin operations for platform management
 */
export class AdminController {
  /**
   * Get platform statistics (Super Admin only)
   */
  async getPlatformStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      // Get platform-wide statistics
      const stats = await db.transaction(async (tx) => {
        const userStats = await tx
          .select({
            totalUsers: sql<number>`COUNT(*)`,
            activeUsers: sql<number>`COUNT(CASE WHEN ${users.is_active} = true THEN 1 END)`,
            students: sql<number>`COUNT(CASE WHEN ${users.role} = 'student' THEN 1 END)`,
            farmers: sql<number>`COUNT(CASE WHEN ${users.role} = 'farmer' THEN 1 END)`,
            instructors: sql<number>`COUNT(CASE WHEN ${users.role} = 'instructor' THEN 1 END)`,
            institutionAdmins: sql<number>`COUNT(CASE WHEN ${users.role} = 'institution_admin' THEN 1 END)`,
          })
          .from(users);

        const institutionStats = await tx
          .select({
            totalInstitutions: sql<number>`COUNT(*)`,
            institutionsWithUsers: sql<number>`COUNT(CASE WHEN ${institutions.created_by} IS NOT NULL THEN 1 END)`,
          })
          .from(institutions);

        return {
          users: userStats[0],
          institutions: institutionStats[0],
          timestamp: new Date().toISOString()
        };
      });

      res.json({
        success: true,
        data: stats
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get all institutions (Super Admin only)
   */
  async getAllInstitutions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      const institutionsList = await db
        .select({
          institutionId: institutions.institution_id,
          name: institutions.name,
          description: institutions.description,
          logoUrl: institutions.logo_url,
          emailDomain: institutions.email_domain,
          createdBy: institutions.created_by,
          createdAt: institutions.created_at,
          updatedAt: institutions.updated_at,
        })
        .from(institutions)
        .orderBy(institutions.created_at);

      res.json({
        success: true,
        data: institutionsList
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get all users across the platform (Super Admin only)
   */
  async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      const usersList = await db
        .select({
          userId: users.user_id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
          role: users.role,
          institutionId: users.institution_id,
          isActive: users.is_active,
          clerkUserId: users.clerk_user_id,
          createdAt: users.created_at,
          updatedAt: users.updated_at,
        })
        .from(users)
        .orderBy(users.created_at);

      res.json({
        success: true,
        data: usersList
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get users by institution (Institution Admin + Super Admin)
   */
  async getUsersByInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { institutionId } = req.params;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      // Super Admin can access all institutions
      if (auth.role !== 'super_admin') {
        // Institution Admin can only access their own institution
        if (auth.role !== 'institution_admin') {
          return next(createHttpError(403, 'Insufficient permissions'));
        }

        // Verify the user belongs to the requested institution
        if (auth.institutionId !== institutionId) {
          return next(createHttpError(403, 'Access denied: Cannot access users from different institution'));
        }
      }

      const usersList = await db
        .select({
          userId: users.user_id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
          role: users.role,
          isActive: users.is_active,
          clerkUserId: users.clerk_user_id,
          createdAt: users.created_at,
          updatedAt: users.updated_at,
        })
        .from(users)
        .where(eq(users.institution_id, institutionId))
        .orderBy(users.created_at);

      res.json({
        success: true,
        data: usersList
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Create a new institution (Super Admin only)
   */
  async createInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { name, description, logoUrl, emailDomain } = req.body;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      if (!name) {
        return next(createHttpError(400, 'Institution name is required'));
      }

      const [newInstitution] = await db
        .insert(institutions)
        .values({
          name,
          description: description || null,
          logo_url: logoUrl || null,
          email_domain: emailDomain || null,
          created_by: auth.userId,
          created_at: new Date(),
        })
        .returning({
          institutionId: institutions.institution_id,
          name: institutions.name,
          description: institutions.description,
          logoUrl: institutions.logo_url,
          emailDomain: institutions.email_domain,
          createdBy: institutions.created_by,
          createdAt: institutions.created_at,
        });

      res.status(201).json({
        success: true,
        data: newInstitution
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Update institution (Super Admin only)
   */
  async updateInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { institutionId } = req.params;
      const { name, description, logoUrl, emailDomain } = req.body;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      const [updatedInstitution] = await db
        .update(institutions)
        .set({
          name: name || sql`name`,
          description: description || sql`description`,
          logo_url: logoUrl || sql`logo_url`,
          email_domain: emailDomain || sql`email_domain`,
          updated_at: new Date(),
        })
        .where(eq(institutions.institution_id, institutionId))
        .returning({
          institutionId: institutions.institution_id,
          name: institutions.name,
          description: institutions.description,
          logoUrl: institutions.logo_url,
          emailDomain: institutions.email_domain,
          updatedBy: institutions.created_by,
          updatedAt: institutions.updated_at,
        });

      if (!updatedInstitution) {
        return next(createHttpError(404, 'Institution not found'));
      }

      res.json({
        success: true,
        data: updatedInstitution
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Delete institution (Super Admin only)
   */
  async deleteInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { institutionId } = req.params;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      // Check if institution exists and get its details
      const [institution] = await db
        .select()
        .from(institutions)
        .where(eq(institutions.institution_id, institutionId))
        .limit(1);

      if (!institution) {
        return next(createHttpError(404, 'Institution not found'));
      }

      // Delete the institution (users will have institution_id set to NULL due to ON DELETE SET NULL)
      await db
        .delete(institutions)
        .where(eq(institutions.institution_id, institutionId));

      res.json({
        success: true,
        message: 'Institution deleted successfully'
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Promote user to Institution Admin (Super Admin only)
   */
  async promoteToInstitutionAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { userId } = req.params;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      // Check if user exists and belongs to an institution
      const [user] = await db
        .select({
          userId: users.user_id,
          role: users.role,
          institutionId: users.institution_id,
          email: users.email,
        })
        .from(users)
        .where(eq(users.user_id, userId))
        .limit(1);

      if (!user) {
        return next(createHttpError(404, 'User not found'));
      }

      if (!user.institutionId) {
        return next(createHttpError(400, 'User must belong to an institution to be promoted'));
      }

      if (user.role === 'institution_admin') {
        return next(createHttpError(400, 'User is already an Institution Admin'));
      }

      const [updatedUser] = await db
        .update(users)
        .set({
          role: 'institution_admin' as Role,
          updated_at: new Date(),
        })
        .where(eq(users.user_id, userId))
        .returning({
          userId: users.user_id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
          role: users.role,
          institutionId: users.institution_id,
        });

      res.json({
        success: true,
        data: updatedUser,
        message: 'User promoted to Institution Admin successfully'
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Demote Institution Admin to regular user (Super Admin only)
   */
  async demoteInstitutionAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { userId } = req.params;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      // Check if user exists and is an Institution Admin
      const [user] = await db
        .select({
          userId: users.user_id,
          role: users.role,
          institutionId: users.institution_id,
          email: users.email,
        })
        .from(users)
        .where(eq(users.user_id, userId))
        .limit(1);

      if (!user) {
        return next(createHttpError(404, 'User not found'));
      }

      if (user.role !== 'institution_admin') {
        return next(createHttpError(400, 'User is not an Institution Admin'));
      }

      const [updatedUser] = await db
        .update(users)
        .set({
          role: 'instructor' as Role, // Default role for demoted admins
          updated_at: new Date(),
        })
        .where(eq(users.user_id, userId))
        .returning({
          userId: users.user_id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
          role: users.role,
          institutionId: users.institution_id,
        });

      res.json({
        success: true,
        data: updatedUser,
        message: 'Institution Admin demoted successfully'
      });
    } catch (err) {
      next(err as Error);
    }
  }
}

// Export singleton instance
export const adminController = new AdminController();