import { Request, Response, NextFunction } from 'express';
import { eq, sql } from 'drizzle-orm';
import { db } from '../db/dbconfig';
import { users, institutions, courses, course_enrollments, course_ratings } from '../db/schema';
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
 * Instructors Controller
 * Handles instructor management within institutions
 */
export class InstructorsController {
  /**
   * Create a new instructor under an institution (Institution Admin + Super Admin)
   */
  async createInstructor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { email, firstName, lastName, clerkUserId } = req.body;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      // Only Institution Admin and Super Admin can create instructors
      if (auth.role !== 'institution_admin' && auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Institution admin access required'));
      }

      if (!email || !firstName || !lastName) {
        return next(createHttpError(400, 'Email, first name, and last name are required'));
      }

      // Determine institution ID
      let institutionId: string | null = null;
      if (auth.role === 'super_admin') {
        // Super Admin can create instructors for any institution (institution_id can be null)
        institutionId = req.body.institutionId ?? null;
      } else {
        // Institution Admin can only create instructors for their own institution
        institutionId = auth.institutionId ?? null;
        if (!institutionId) {
          return next(createHttpError(400, 'Admin must belong to an institution'));
        }
      }

      // Check if user already exists
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        return next(createHttpError(409, 'User with this email already exists'));
      }

      const [newInstructor] = await db
        .insert(users)
        .values({
          email,
          first_name: firstName,
          last_name: lastName,
          clerk_user_id: clerkUserId || null,
          role: 'instructor' as Role,
          institution_id: institutionId,
          is_active: true,
          created_at: new Date(),
        })
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

      res.status(201).json({
        success: true,
        data: newInstructor,
        message: 'Instructor created successfully'
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get all instructors in an institution (Institution Admin + Super Admin)
   */
  async getInstructorsByInstitution(req: Request, res: Response, next: NextFunction): Promise<void> {
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
          return next(createHttpError(403, 'Access denied: Cannot access instructors from different institution'));
        }
      }

      const instructorsList = await db
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
        .where(sql`${users.institution_id} = ${institutionId} AND ${users.role} = 'instructor'`)
        .orderBy(users.created_at);

      res.json({
        success: true,
        data: instructorsList
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get all instructors across the platform (Super Admin only)
   */
  async getAllInstructors(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;

      if (!auth || auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Super admin access required'));
      }

      const instructorsList = await db
        .select({
          userId: users.user_id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
          institutionId: users.institution_id,
          isActive: users.is_active,
          clerkUserId: users.clerk_user_id,
          createdAt: users.created_at,
          updatedAt: users.updated_at,
        })
        .from(users)
        .where(eq(users.role, 'instructor'))
        .orderBy(users.created_at);

      res.json({
        success: true,
        data: instructorsList
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Update instructor details (Institution Admin + Super Admin)
   */
  async updateInstructor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { userId } = req.params;
      const { firstName, lastName, isActive } = req.body;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      // Only Institution Admin and Super Admin can update instructors
      if (auth.role !== 'institution_admin' && auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Institution admin access required'));
      }

      // Check if instructor exists and belongs to the correct institution
      const [instructor] = await db
        .select({
          userId: users.user_id,
          role: users.role,
          institutionId: users.institution_id,
          email: users.email,
        })
        .from(users)
        .where(eq(users.user_id, userId))
        .limit(1);

      if (!instructor) {
        return next(createHttpError(404, 'Instructor not found'));
      }

      if (instructor.role !== 'instructor') {
        return next(createHttpError(400, 'User is not an instructor'));
      }

      // Verify access permissions
      if (auth.role !== 'super_admin') {
        if (auth.role !== 'institution_admin') {
          return next(createHttpError(403, 'Insufficient permissions'));
        }

        if (auth.institutionId !== instructor.institutionId) {
          return next(createHttpError(403, 'Access denied: Cannot update instructor from different institution'));
        }
      }

      const [updatedInstructor] = await db
        .update(users)
        .set({
          first_name: firstName || sql`first_name`,
          last_name: lastName || sql`last_name`,
          is_active: isActive !== undefined ? isActive : sql`is_active`,
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
        });

      res.json({
        success: true,
        data: updatedInstructor,
        message: 'Instructor updated successfully'
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Delete instructor (Institution Admin + Super Admin)
   */
  async deleteInstructor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { userId } = req.params;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      // Only Institution Admin and Super Admin can delete instructors
      if (auth.role !== 'institution_admin' && auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Institution admin access required'));
      }

      // Check if instructor exists and belongs to the correct institution
      const [instructor] = await db
        .select({
          userId: users.user_id,
          role: users.role,
          institutionId: users.institution_id,
          email: users.email,
        })
        .from(users)
        .where(eq(users.user_id, userId))
        .limit(1);

      if (!instructor) {
        return next(createHttpError(404, 'Instructor not found'));
      }

      if (instructor.role !== 'instructor') {
        return next(createHttpError(400, 'User is not an instructor'));
      }

      // Verify access permissions
      if (auth.role !== 'super_admin') {
        if (auth.role !== 'institution_admin') {
          return next(createHttpError(403, 'Insufficient permissions'));
        }

        if (auth.institutionId !== instructor.institutionId) {
          return next(createHttpError(403, 'Access denied: Cannot delete instructor from different institution'));
        }
      }

      // Soft delete by deactivating the user
      await db
        .update(users)
        .set({
          is_active: false,
          updated_at: new Date(),
        })
        .where(eq(users.user_id, userId));

      res.json({
        success: true,
        message: 'Instructor deactivated successfully'
      });
    } catch (err) {
      next(err as Error);
    }
  }

  /**
   * Get instructor statistics (Institution Admin + Super Admin)
   */
  async getInstructorStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const auth = (req as any).auth as AuthContext;
      const { userId } = req.params;

      if (!auth) {
        return next(createHttpError(401, 'Authentication required'));
      }

      // Only Institution Admin and Super Admin can view instructor stats
      if (auth.role !== 'institution_admin' && auth.role !== 'super_admin') {
        return next(createHttpError(403, 'Institution admin access required'));
      }

      // Check if instructor exists and belongs to the correct institution
      const [instructor] = await db
        .select({
          userId: users.user_id,
          role: users.role,
          institutionId: users.institution_id,
          email: users.email,
          firstName: users.first_name,
          lastName: users.last_name,
        })
        .from(users)
        .where(eq(users.user_id, userId))
        .limit(1);

      if (!instructor) {
        return next(createHttpError(404, 'Instructor not found'));
      }

      if (instructor.role !== 'instructor') {
        return next(createHttpError(400, 'User is not an instructor'));
      }

      // Verify access permissions
      if (auth.role !== 'super_admin') {
        if (auth.role !== 'institution_admin') {
          return next(createHttpError(403, 'Insufficient permissions'));
        }

        if (auth.institutionId !== instructor.institutionId) {
          return next(createHttpError(403, 'Access denied: Cannot view stats for instructor from different institution'));
        }
      }

      // Get instructor statistics
      const stats = await db.transaction(async (tx) => {
        const courseStats = await tx
          .select({
            totalCourses: sql<number>`COUNT(*)`,
            publishedCourses: sql<number>`COUNT(CASE WHEN ${courses.status} = 'published' THEN 1 END)`,
            draftCourses: sql<number>`COUNT(CASE WHEN ${courses.status} = 'draft' THEN 1 END)`,
          })
          .from(courses)
          .where(eq(courses.creator_id, userId));

        const enrollmentStats = await tx
          .select({
            totalEnrollments: sql<number>`COUNT(*)`,
            activeEnrollments: sql<number>`COUNT(CASE WHEN ${course_enrollments.enrollment_status} = 'in_progress' THEN 1 END)`,
          })
          .from(course_enrollments)
          .innerJoin(courses, eq(course_enrollments.course_id, courses.course_id))
          .where(eq(courses.creator_id, userId));

        const ratingStats = await tx
          .select({
            averageRating: sql<number>`AVG(${course_ratings.rating_value})`,
            totalRatings: sql<number>`COUNT(*)`,
          })
          .from(course_ratings)
          .innerJoin(courses, eq(course_ratings.course_id, courses.course_id))
          .where(eq(courses.creator_id, userId));

        return {
          instructor: {
            userId: instructor.userId,
            email: instructor.email,
            name: `${instructor.firstName} ${instructor.lastName}`,
          },
          courses: courseStats[0] || { totalCourses: 0, publishedCourses: 0, draftCourses: 0 },
          enrollments: enrollmentStats[0] || { totalEnrollments: 0, activeEnrollments: 0 },
          ratings: ratingStats[0] || { averageRating: 0, totalRatings: 0 },
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
export const instructorsController = new InstructorsController();