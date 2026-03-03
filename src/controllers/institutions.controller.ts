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
 * Institutions Controller
 * Handles institution management and admin assignments
 */
export class InstitutionsController {
  /**
   * Create a new institution (Super Admin only)
   */
  async createInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { name, description, logoUrl, emailDomain } = req.body;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      // Only Super Admin can create institutions
      if (auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      if (!name) {
        return next(createHttpError(400, 'Institution name is required'));
      }

      // Check if institution already exists
      const [existingInstitution] = await db
        .select()
        .from(institutions)
        .where(eq(institutions.name, name))
        .limit(1);

      if (existingInstitution) {
        return next(createHttpError(409, 'Institution with this name already exists'));
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
        data: newInstitution,
        message: 'Institution created successfully'
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
   * Get institution by ID (Super Admin only)
   */
  async getInstitutionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { institutionId } = req.params;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      const [institution] = await db
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
        .where(eq(institutions.institution_id, institutionId))
        .limit(1);

      if (!institution) {
        return next(createHttpError(404, 'Institution not found'));
      }

      res.json({
        success: true,
        data: institution
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

      // Check if institution exists
      const [existingInstitution] = await db
        .select()
        .from(institutions)
        .where(eq(institutions.institution_id, institutionId))
        .limit(1);

      if (!existingInstitution) {
        return next(createHttpError(404, 'Institution not found'));
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
          createdBy: institutions.created_by,
          createdAt: institutions.created_at,
          updatedAt: institutions.updated_at,
        });

      res.json({
        success: true,
        data: updatedInstitution,
        message: 'Institution updated successfully'
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Delete institution (Super Admin only)
   * Sets users' institution_id to NULL instead of deleting users
   */
  async deleteInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { institutionId } = req.params;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      // Check if institution exists
      const [existingInstitution] = await db
        .select()
        .from(institutions)
        .where(eq(institutions.institution_id, institutionId))
        .limit(1);

      if (!existingInstitution) {
        return next(createHttpError(404, 'Institution not found'));
      }

      // Set users' institution_id to NULL
      await db
        .update(users)
        .set({
          institution_id: null,
          updated_at: new Date(),
        })
        .where(eq(users.institution_id, institutionId));

      // Delete the institution
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
   * Get institution admins (Super Admin only)
   */
  async getInstitutionAdmins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { institutionId } = req.params;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      const adminsList = await db
        .select({
          userId: users.user_id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
          isActive: users.is_active,
          clerkUserId: users.clerk_user_id,
          createdAt: users.created_at,
          updatedAt: users.updated_at,
        })
        .from(users)
        .where(sql`${users.institution_id} = ${institutionId} AND ${users.role} = 'institution_admin'`)
        .orderBy(users.created_at);

      res.json({
        success: true,
        data: adminsList
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Assign admin to institution (Super Admin only)
   */
  async assignAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { institutionId } = req.params;
      const { userId } = req.body;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      if (!userId) {
        return next(createHttpError(400, 'User ID is required'));
      }

      // Check if user exists
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

      // Check if institution exists
      const [institution] = await db
        .select()
        .from(institutions)
        .where(eq(institutions.institution_id, institutionId))
        .limit(1);

      if (!institution) {
        return next(createHttpError(404, 'Institution not found'));
      }

      // Check if user is already an admin
      if (user.role === 'institution_admin') {
        return next(createHttpError(400, 'User is already an institution admin'));
      }

      // Check if user belongs to the institution
      if (user.institutionId !== institutionId) {
        return next(createHttpError(400, 'User must belong to the institution'));
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
          isActive: users.is_active,
          clerkUserId: users.clerk_user_id,
        });

      res.json({
        success: true,
        data: updatedUser,
        message: 'User promoted to institution admin successfully'
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get institution statistics (Super Admin only)
   */
  async getInstitutionStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { institutionId } = req.params;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      // Get institution statistics
      const stats = await db.transaction(async (tx) => {
        const userStats = await tx
          .select({
            totalUsers: sql<number>`COUNT(*)`,
            students: sql<number>`COUNT(CASE WHEN ${users.role} = 'student' THEN 1 END)`,
            farmers: sql<number>`COUNT(CASE WHEN ${users.role} = 'farmer' THEN 1 END)`,
            instructors: sql<number>`COUNT(CASE WHEN ${users.role} = 'instructor' THEN 1 END)`,
            admins: sql<number>`COUNT(CASE WHEN ${users.role} = 'institution_admin' THEN 1 END)`,
          })
          .from(users)
          .where(eq(users.institution_id, institutionId));

        const [institution] = await tx
          .select({
            institutionId: institutions.institution_id,
            name: institutions.name,
            description: institutions.description,
            logoUrl: institutions.logo_url,
            emailDomain: institutions.email_domain,
            createdBy: institutions.created_by,
            createdAt: institutions.created_at,
          })
          .from(institutions)
          .where(eq(institutions.institution_id, institutionId))
          .limit(1);

        return {
          institution: institution || { institutionId, name: 'Unknown Institution' },
          userStats: userStats[0] || { totalUsers: 0, students: 0, farmers: 0, instructors: 0, admins: 0 },
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
}

// Export singleton instance
export const institutionsController = new InstitutionsController();