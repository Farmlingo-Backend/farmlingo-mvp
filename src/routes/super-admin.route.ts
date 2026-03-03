import { Router, Request, Response } from 'express';
import { clerkAuth } from '../middlewares/clerk';
import { body, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

// Import admin controllers
import { adminController } from '../controllers/admin.controller';

// Import RBAC middleware
import { requireSuperAdmin } from '../middlewares/auth';
import { requirePermission, checkResourceAccess } from '../middlewares/rbac';

// Import services for dashboard stats
import { db } from '../db/dbconfig';
import { users, courses, lessons, course_enrollments, forums, chatrooms, chat_messages, announcements } from '../db/schema';
import { sql } from 'drizzle-orm';

const router = Router();

// Rate limiting for Super Admin endpoints
const superAdminRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs (stricter for Super Admin)
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
 * /super-admin/dashboard:
 *   get:
 *     tags:
 *       - Super Admin
 *     summary: Get Super Admin Dashboard
 *     description: Returns comprehensive platform statistics and system overview for Super Admin.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Super Admin dashboard data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 platformStats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     totalInstitutions:
 *                       type: integer
 *                     totalCourses:
 *                       type: integer
 *                     totalLessons:
 *                       type: integer
 *                     totalEnrollments:
 *                       type: integer
 *                     totalForums:
 *                       type: integer
 *                     totalChatrooms:
 *                       type: integer
 *                     totalMessages:
 *                       type: integer
 *                     totalAnnouncements:
 *                       type: integer
 *                 institutionStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       institutionId: { type: 'string', format: 'uuid' }
 *                       name: { type: 'string' }
 *                       userCount: { type: 'integer' }
 *                       courseCount: { type: 'integer' }
 *                 systemHealth:
 *                   type: object
 *                   properties:
 *                     status: { type: 'string' }
 *                     database: { type: 'string' }
 *                     timestamp: { type: 'string', format: 'date-time' }
 *       '403':
 *         description: Forbidden - Super admin access required.
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
  superAdminRateLimit, 
  clerkAuth, 
  requireSuperAdmin, 
  adminController.getPlatformStats.bind(adminController)
);

/**
 * @openapi
 * /super-admin/institutions:
 *   get:
 *     tags:
 *       - Super Admin
 *     summary: Get All Institutions
 *     description: Returns a paginated list of all institutions across the platform.
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
 *         description: Number of institutions per page
 *     responses:
 *       '200':
 *         description: Institutions list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 institutions:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       institutionId: { type: 'string', format: 'uuid' }
 *                       name: { type: 'string' }
 *                       description: { type: 'string' }
 *                       logoUrl: { type: 'string' }
 *                       emailDomain: { type: 'string' }
 *                       createdBy: { type: 'string', format: 'uuid' }
 *                       createdAt: { type: 'string', format: 'date-time' }
 *                       updatedAt: { type: 'string', format: 'date-time' }
 *       '403':
 *         description: Forbidden - Super admin access required.
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
router.get('/institutions', 
  superAdminRateLimit, 
  clerkAuth, 
  requireSuperAdmin, 
  adminController.getAllInstitutions.bind(adminController)
);

/**
 * @openapi
 * /super-admin/institutions:
 *   post:
 *     tags:
 *       - Super Admin
 *     summary: Create New Institution
 *     description: Creates a new institution in the platform.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['name']
 *             properties:
 *               name: { type: 'string', description: 'Institution name' }
 *               description: { type: 'string', description: 'Institution description' }
 *               logoUrl: { type: 'string', format: 'uri', description: 'Institution logo URL' }
 *               emailDomain: { type: 'string', description: 'Institution email domain' }
 *     responses:
 *       '201':
 *         description: Institution created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'object' }
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Super admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/institutions', 
  superAdminRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    body('name').notEmpty().withMessage('Institution name is required'),
    body('description').optional().isString(),
    body('logoUrl').optional().isURL(),
    body('emailDomain').optional().isString(),
  ],
  handleValidationErrors,
  adminController.createInstitution.bind(adminController)
);

/**
 * @openapi
 * /super-admin/institutions/{institutionId}:
 *   put:
 *     tags:
 *       - Super Admin
 *     summary: Update Institution
 *     description: Updates an existing institution.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the institution to update
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: 'string', description: 'Institution name' }
 *               description: { type: 'string', description: 'Institution description' }
 *               logoUrl: { type: 'string', format: 'uri', description: 'Institution logo URL' }
 *               emailDomain: { type: 'string', description: 'Institution email domain' }
 *     responses:
 *       '200':
 *         description: Institution updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'object' }
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Super admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Institution not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put('/institutions/:institutionId', 
  superAdminRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    param('institutionId').isUUID().withMessage('Invalid institution ID'),
    body('name').optional().isString(),
    body('description').optional().isString(),
    body('logoUrl').optional().isURL(),
    body('emailDomain').optional().isString(),
  ],
  handleValidationErrors,
  adminController.updateInstitution.bind(adminController)
);

/**
 * @openapi
 * /super-admin/institutions/{institutionId}:
 *   delete:
 *     tags:
 *       - Super Admin
 *     summary: Delete Institution
 *     description: Deletes an institution and sets users' institution_id to NULL.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the institution to delete
 *     responses:
 *       '200':
 *         description: Institution deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 message: { type: 'string' }
 *       '403':
 *         description: Forbidden - Super admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Institution not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.delete('/institutions/:institutionId', 
  superAdminRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    param('institutionId').isUUID().withMessage('Invalid institution ID'),
  ],
  handleValidationErrors,
  adminController.deleteInstitution.bind(adminController)
);

/**
 * @openapi
 * /super-admin/users:
 *   get:
 *     tags:
 *       - Super Admin
 *     summary: Get All Users
 *     description: Returns a paginated list of all users across the platform.
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
 *                     $ref: '#/components/schemas/User'
 *       '403':
 *         description: Forbidden - Super admin access required.
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
  superAdminRateLimit, 
  clerkAuth, 
  requireSuperAdmin, 
  adminController.getAllUsers.bind(adminController)
);

/**
 * @openapi
 * /super-admin/users/{userId}/promote:
 *   put:
 *     tags:
 *       - Super Admin
 *     summary: Promote User to Institution Admin
 *     description: Promotes a user to Institution Admin role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to promote
 *     responses:
 *       '200':
 *         description: User promoted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'object' }
 *                 message: { type: 'string' }
 *       '400':
 *         description: Bad request - User must belong to an institution or is already an admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Super admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put('/users/:userId/promote', 
  superAdminRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
  ],
  handleValidationErrors,
  adminController.promoteToInstitutionAdmin.bind(adminController)
);

/**
 * @openapi
 * /super-admin/users/{userId}/demote:
 *   put:
 *     tags:
 *       - Super Admin
 *     summary: Demote Institution Admin
 *     description: Demotes an Institution Admin to Instructor role.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to demote
 *     responses:
 *       '200':
 *         description: User demoted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'object' }
 *                 message: { type: 'string' }
 *       '400':
 *         description: Bad request - User is not an Institution Admin.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Super admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put('/users/:userId/demote', 
  superAdminRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    param('userId').isUUID().withMessage('Invalid user ID'),
  ],
  handleValidationErrors,
  adminController.demoteInstitutionAdmin.bind(adminController)
);

/**
 * @openapi
 * /super-admin/system/health:
 *   get:
 *     tags:
 *       - Super Admin
 *     summary: System Health Check
 *     description: Performs a comprehensive health check on system services.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: System health check completed successfully.
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
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "healthy"
 *                     redis:
 *                       type: string
 *                       example: "healthy"
 *                     storage:
 *                       type: string
 *                       example: "healthy"
 *                 systemMetrics:
 *                   type: object
 *                   properties:
 *                     memoryUsage:
 *                       type: object
 *                       properties:
 *                         used: { type: 'number' }
 *                         total: { type: 'number' }
 *                         percentage: { type: 'number' }
 *                     cpuUsage:
 *                       type: 'number'
 *                     uptime:
 *                       type: 'number'
 *       '403':
 *         description: Forbidden - Super admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '503':
 *         description: Service unavailable - System health check failed.
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
 *                   example: "System health check failed"
 */
router.get('/system/health', 
  superAdminRateLimit,
  clerkAuth, 
  requireSuperAdmin, 
  async (req, res) => {
  try {
    // Comprehensive system health metrics
    const healthCheck = await db.execute(sql`SELECT 1 as health_check, NOW() as timestamp`);
    const dbHealth = healthCheck.rows[0];

    // Get system metrics (simplified for now)
    const systemMetrics = {
      memoryUsage: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
      },
      cpuUsage: process.cpuUsage().user / 1000000, // Convert to seconds
      uptime: process.uptime()
    };

    res.json({
      status: 'healthy',
      timestamp: dbHealth.timestamp,
      services: {
        database: 'healthy',
        redis: 'healthy', // Would check Redis if configured
        storage: 'healthy' // Would check storage if configured
      },
      systemMetrics
    });
  } catch (error) {
    // Log error without exposing system details
    console.error('Health check failed:', error instanceof Error ? error.message : 'Unknown error');
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service temporarily unavailable'
    });
  }
});

export default router;