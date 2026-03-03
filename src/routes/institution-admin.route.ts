import { Router, Request, Response } from 'express';
import { clerkAuth } from '../middlewares/clerk';
import { body, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

// Import admin controllers
import { adminController } from '../controllers/admin.controller';

// Import RBAC middleware
import { requireInstitutionAdmin } from '../middlewares/auth';
import { requirePermission, checkResourceAccess } from '../middlewares/rbac';

// Import services for dashboard stats
import { db } from '../db/dbconfig';
import { users, courses, lessons, course_enrollments, forums, chatrooms, chat_messages, announcements } from '../db/schema';
import { sql } from 'drizzle-orm';

const router = Router();

// Rate limiting for Institution Admin endpoints
const institutionAdminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 75, // limit each IP to 75 requests per windowMs (moderate for Institution Admin)
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation helper
const handleValidationErrors = (req: Request, res: Response, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array().map((err: any) => ({ field: err.path || err.param, message: err.msg }))
    });
  }
  next();
};

// UUID validation helper
const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * @openapi
 * /institution-admin/dashboard:
 *   get:
 *     tags:
 *       - Institution Admin
 *     summary: Get Institution Admin Dashboard
 *     description: Returns institution-specific statistics and overview for Institution Admin.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Institution Admin dashboard data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 institutionStats:
 *                   type: object
 *                   properties:
 *                     institutionId: { type: 'string', format: 'uuid' }
 *                     name: { type: 'string' }
 *                     userCount: { type: 'integer' }
 *                     courseCount: { type: 'integer' }
 *                     lessonCount: { type: 'integer' }
 *                     enrollmentCount: { type: 'integer' }
 *                     forumCount: { type: 'integer' }
 *                     chatroomCount: { type: 'integer' }
 *                 userStats:
 *                   type: object
 *                   properties:
 *                     totalUsers: { type: 'integer' }
 *                     activeUsers: { type: 'integer' }
 *                     students: { type: 'integer' }
 *                     farmers: { type: 'integer' }
 *                     instructors: { type: 'integer' }
 *                 recentActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       action: { type: 'string' }
 *                       user: { type: 'string' }
 *                       timestamp: { type: 'string', format: 'date-time' }
 *       '403':
 *         description: Forbidden - Institution admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/dashboard', 
  institutionAdminRateLimit, 
  clerkAuth, 
  requireInstitutionAdmin, 
  async (req, res) => {
    try {
      const auth = (req as any).auth as any;
      const institutionId = auth.institutionId;

      if (!institutionId) {
        return res.status(400).json({ error: 'User must belong to an institution' });
      }

      // Get institution-specific statistics
      const [
        userStats,
        courseStats,
        lessonStats,
        enrollmentStats,
        forumStats,
        chatroomStats
      ] = await Promise.all([
        db.select({
          totalUsers: sql<number>`count(*)`,
          activeUsers: sql<number>`count(CASE WHEN ${users.is_active} = true THEN 1 END)`,
          students: sql<number>`count(CASE WHEN ${users.role} = 'student' THEN 1 END)`,
          farmers: sql<number>`count(CASE WHEN ${users.role} = 'farmer' THEN 1 END)`,
          instructors: sql<number>`count(CASE WHEN ${users.role} = 'instructor' THEN 1 END)`,
        })
        .from(users)
        .where(sql`${users.institution_id} = ${institutionId}`),
        
        db.select({ count: sql<number>`count(*)` }).from(courses).where(sql`${courses.institution_id} = ${institutionId}`),
        db.select({ count: sql<number>`count(*)` }).from(lessons).where(sql`${lessons.institution_id} = ${institutionId}`),
        db.select({ count: sql<number>`count(*)` }).from(course_enrollments).where(sql`${course_enrollments.institution_id} = ${institutionId}`),
        db.select({ count: sql<number>`count(*)` }).from(forums).where(sql`${forums.institution_id} = ${institutionId}`),
        db.select({ count: sql<number>`count(*)` }).from(chatrooms).where(sql`${chatrooms.institution_id} = ${institutionId}`)
      ]);

      // Get institution details
      const [institution] = await db
        .select()
        .from(users)
        .where(sql`${users.user_id} = ${auth.userId}`)
        .limit(1);

      res.json({
        institutionStats: {
          institutionId: institutionId,
          name: institution?.first_name || 'Unknown Institution',
          userCount: userStats[0]?.totalUsers || 0,
          courseCount: courseStats[0]?.count || 0,
          lessonCount: lessonStats[0]?.count || 0,
          enrollmentCount: enrollmentStats[0]?.count || 0,
          forumCount: forumStats[0]?.count || 0,
          chatroomCount: chatroomStats[0]?.count || 0
        },
        userStats: userStats[0] || {},
        recentActivity: [] // Would implement activity tracking
      });
    } catch (error) {
      console.error('Error fetching institution dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
  }
);

/**
 * @openapi
 * /institution-admin/users:
 *   get:
 *     tags:
 *       - Institution Admin
 *     summary: Get Institution Users
 *     description: Returns a paginated list of users within the institution.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, farmer, instructor, institution_admin]
 *         description: Filter users by role
 *     responses:
 *       '200':
 *         description: Users list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId: { type: 'string', format: 'uuid' }
 *                       email: { type: 'string' }
 *                       firstName: { type: 'string' }
 *                       lastName: { type: 'string' }
 *                       role: { type: 'string' }
 *                       isActive: { type: 'boolean' }
 *                       clerkUserId: { type: 'string' }
 *                       createdAt: { type: 'string', format: 'date-time' }
 *                       updatedAt: { type: 'string', format: 'date-time' }
 *       '403':
 *         description: Forbidden - Institution admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/users', 
  institutionAdminRateLimit, 
  clerkAuth, 
  requireInstitutionAdmin,
  adminController.getUsersByInstitution.bind(adminController)
);

/**
 * @openapi
 * /institution-admin/courses:
 *   get:
 *     tags:
 *       - Institution Admin
 *     summary: Get Institution Courses
 *     description: Returns a paginated list of courses within the institution.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of courses per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [published, draft, archived]
 *         description: Filter courses by status
 *     responses:
 *       '200':
 *         description: Courses list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *       '403':
 *         description: Forbidden - Institution admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/courses', 
  institutionAdminRateLimit, 
  clerkAuth, 
  requireInstitutionAdmin,
  async (req, res) => {
    try {
      const auth = (req as any).auth as any;
      const institutionId = auth.institutionId;
      const { page = 1, limit = 50, status } = req.query;

      if (!institutionId) {
        return res.status(400).json({ error: 'User must belong to an institution' });
      }

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const limitNum = parseInt(limit as string);

      const coursesList = await db.select()
        .from(courses)
        .where(sql`${courses.institution_id} = ${institutionId}`)
        .limit(limitNum)
        .offset(offset)
        .orderBy(sql`${courses.created_at} desc`);

      res.json({
        courses: coursesList
      });
    } catch (error) {
      console.error('Error fetching institution courses:', error);
      res.status(500).json({ error: 'Failed to fetch courses' });
    }
  }
);

/**
 * @openapi
 * /institution-admin/lessons:
 *   get:
 *     tags:
 *       - Institution Admin
 *     summary: Get Institution Lessons
 *     description: Returns a paginated list of lessons within the institution.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of lessons per page
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter lessons by course ID
 *     responses:
 *       '200':
 *         description: Lessons list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lessons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 *       '403':
 *         description: Forbidden - Institution admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/lessons', 
  institutionAdminRateLimit, 
  clerkAuth, 
  requireInstitutionAdmin,
  async (req, res) => {
    try {
      const auth = (req as any).auth as any;
      const institutionId = auth.institutionId;
      const { page = 1, limit = 50, courseId } = req.query;

      if (!institutionId) {
        return res.status(400).json({ error: 'User must belong to an institution' });
      }

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const limitNum = parseInt(limit as string);

      const lessonsList = await db.select()
        .from(lessons)
        .where(sql`${lessons.institution_id} = ${institutionId}`)
        .limit(limitNum)
        .offset(offset)
        .orderBy(sql`${lessons.created_at} desc`);

      res.json({
        lessons: lessonsList
      });
    } catch (error) {
      console.error('Error fetching institution lessons:', error);
      res.status(500).json({ error: 'Failed to fetch lessons' });
    }
  }
);

/**
 * @openapi
 * /institution-admin/enrollments:
 *   get:
 *     tags:
 *       - Institution Admin
 *     summary: Get Institution Enrollments
 *     description: Returns a paginated list of course enrollments within the institution.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of enrollments per page
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter enrollments by course ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter enrollments by user ID
 *     responses:
 *       '200':
 *         description: Enrollments list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enrollments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseEnrollment'
 *       '403':
 *         description: Forbidden - Institution admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/enrollments', 
  institutionAdminRateLimit, 
  clerkAuth, 
  requireInstitutionAdmin,
  async (req, res) => {
    try {
      const auth = (req as any).auth as any;
      const institutionId = auth.institutionId;
      const { page = 1, limit = 50, courseId, userId } = req.query;

      if (!institutionId) {
        return res.status(400).json({ error: 'User must belong to an institution' });
      }

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const limitNum = parseInt(limit as string);

      const enrollmentsList = await db.select()
        .from(course_enrollments)
        .where(sql`${course_enrollments.institution_id} = ${institutionId}`)
        .limit(limitNum)
        .offset(offset)
        .orderBy(sql`${course_enrollments.enrolled_at} desc`);

      res.json({
        enrollments: enrollmentsList
      });
    } catch (error) {
      console.error('Error fetching institution enrollments:', error);
      res.status(500).json({ error: 'Failed to fetch enrollments' });
    }
  }
);

/**
 * @openapi
 * /institution-admin/announcements:
 *   get:
 *     tags:
 *       - Institution Admin
 *     summary: Get Institution Announcements
 *     description: Returns a paginated list of announcements for the institution.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of announcements per page
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to return only active announcements
 *     responses:
 *       '200':
 *         description: Announcements list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 announcements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 *       '403':
 *         description: Forbidden - Institution admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/announcements', 
  institutionAdminRateLimit, 
  clerkAuth, 
  requireInstitutionAdmin,
  async (req, res) => {
    try {
      const auth = (req as any).auth as any;
      const institutionId = auth.institutionId;
      const { page = 1, limit = 50, activeOnly = true } = req.query;

      if (!institutionId) {
        return res.status(400).json({ error: 'User must belong to an institution' });
      }

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      const limitNum = parseInt(limit as string);

      const announcementsList = await db.select()
        .from(announcements)
        .where(sql`${announcements.institution_id} = ${institutionId}`)
        .limit(limitNum)
        .offset(offset)
        .orderBy(sql`${announcements.created_at} desc`);

      res.json({
        announcements: announcementsList
      });
    } catch (error) {
      console.error('Error fetching institution announcements:', error);
      res.status(500).json({ error: 'Failed to fetch announcements' });
    }
  }
);

/**
 * @openapi
 * /institution-admin/system/health:
 *   get:
 *     tags:
 *       - Institution Admin
 *     summary: Institution System Health Check
 *     description: Performs a health check on institution-specific services.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Institution system health check completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 institutionId:
 *                   type: 'string'
 *                   format: 'uuid'
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "healthy"
 *                 institutionMetrics:
 *                   type: object
 *                   properties:
 *                     userCount: { type: 'integer' }
 *                     courseCount: { type: 'integer' }
 *                     activeResources: { type: 'integer' }
 *       '403':
 *         description: Forbidden - Institution admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '503':
 *         description: Service unavailable - Institution health check failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "unhealthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 error:
 *                   type: string
 *                   example: "Institution health check failed"
 */
router.get('/system/health', 
  institutionAdminRateLimit,
  clerkAuth, 
  requireInstitutionAdmin, 
  async (req, res) => {
  try {
    const auth = (req as any).auth as any;
    const institutionId = auth.institutionId;

    if (!institutionId) {
      return res.status(400).json({ error: 'User must belong to an institution' });
    }

    // Institution-specific health check
    const healthCheck = await db.execute(sql`SELECT 1 as health_check, NOW() as timestamp`);
    const dbHealth = healthCheck.rows[0];

    // Get institution metrics
    const [userCount, courseCount, activeResources] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users).where(sql`${users.institution_id} = ${institutionId}`),
      db.select({ count: sql<number>`count(*)` }).from(courses).where(sql`${courses.institution_id} = ${institutionId}`),
      db.select({ count: sql<number>`count(*)` }).from(courses).where(sql`${courses.institution_id} = ${institutionId} AND ${courses.status} = 'published'`)
    ]);

    res.json({
      status: 'healthy',
      timestamp: dbHealth.timestamp,
      institutionId: institutionId,
      services: {
        database: 'healthy'
      },
      institutionMetrics: {
        userCount: userCount[0]?.count || 0,
        courseCount: courseCount[0]?.count || 0,
        activeResources: activeResources[0]?.count || 0
      }
    });
  } catch (error) {
    // Log error without exposing system details
    console.error('Institution health check failed:', error instanceof Error ? error.message : 'Unknown error');
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service temporarily unavailable'
    });
  }
});

export default router;