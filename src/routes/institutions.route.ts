import { Router, Request, Response, NextFunction } from 'express';
import { clerkAuth } from '../middlewares/clerk';
import { body, param, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';

// Import controllers
import { institutionsController } from '../controllers/institutions.controller';

// Import RBAC middleware
import { requireSuperAdmin } from '../middlewares/auth';
import { requirePermission } from '../middlewares/rbac';

const router = Router();

// Rate limiting for Institutions endpoints
const institutionsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation helper
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array().map((err: any) => ({ field: err.path || err.param, message: err.msg }))
    });
  }
  next();
};

/**
 * @openapi
 * /institutions:
 *   post:
 *     tags:
 *       - Institutions
 *     summary: Create New Institution
 *     description: Creates a new institution in the platform (Super Admin only).
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
 *                 message: { type: 'string' }
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
router.post('/', 
  institutionsRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    body('name').notEmpty().withMessage('Institution name is required'),
    body('description').optional().isString(),
    body('logoUrl').optional().isURL(),
    body('emailDomain').optional().isString(),
  ],
  handleValidationErrors,
  institutionsController.createInstitution.bind(institutionsController)
);

/**
 * @openapi
 * /institutions:
 *   get:
 *     tags:
 *       - Institutions
 *     summary: Get All Institutions
 *     description: Returns a paginated list of all institutions across the platform (Super Admin only).
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
router.get('/', 
  institutionsRateLimit, 
  clerkAuth, 
  requireSuperAdmin, 
  institutionsController.getAllInstitutions.bind(institutionsController)
);

/**
 * @openapi
 * /institutions/{institutionId}:
 *   get:
 *     tags:
 *       - Institutions
 *     summary: Get Institution by ID
 *     description: Returns detailed information about a specific institution (Super Admin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the institution to retrieve
 *     responses:
 *       '200':
 *         description: Institution retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'object' }
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
router.get('/:institutionId', 
  institutionsRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    param('institutionId').isUUID().withMessage('Invalid institution ID'),
  ],
  handleValidationErrors,
  institutionsController.getInstitutionById.bind(institutionsController)
);

/**
 * @openapi
 * /institutions/{institutionId}:
 *   put:
 *     tags:
 *       - Institutions
 *     summary: Update Institution
 *     description: Updates an existing institution (Super Admin only).
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
 *                 message: { type: 'string' }
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
router.put('/:institutionId', 
  institutionsRateLimit,
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
  institutionsController.updateInstitution.bind(institutionsController)
);

/**
 * @openapi
 * /institutions/{institutionId}:
 *   delete:
 *     tags:
 *       - Institutions
 *     summary: Delete Institution
 *     description: Deletes an institution and sets users' institution_id to NULL (Super Admin only).
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
router.delete('/:institutionId', 
  institutionsRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    param('institutionId').isUUID().withMessage('Invalid institution ID'),
  ],
  handleValidationErrors,
  institutionsController.deleteInstitution.bind(institutionsController)
);

/**
 * @openapi
 * /institutions/{institutionId}/admins:
 *   get:
 *     tags:
 *       - Institutions
 *     summary: Get Institution Admins
 *     description: Returns a list of all admins for a specific institution (Super Admin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the institution
 *     responses:
 *       '200':
 *         description: Institution admins retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: array }
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
router.get('/:institutionId/admins', 
  institutionsRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    param('institutionId').isUUID().withMessage('Invalid institution ID'),
  ],
  handleValidationErrors,
  institutionsController.getInstitutionAdmins.bind(institutionsController)
);

/**
 * @openapi
 * /institutions/{institutionId}/admins:
 *   post:
 *     tags:
 *       - Institutions
 *     summary: Assign Admin to Institution
 *     description: Promotes a user to institution admin role (Super Admin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the institution
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: ['userId']
 *             properties:
 *               userId: { type: 'string', format: 'uuid', description: 'User ID to promote to admin' }
 *     responses:
 *       '200':
 *         description: User promoted to institution admin successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'object' }
 *                 message: { type: 'string' }
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
 *         description: User or institution not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.post('/:institutionId/admins', 
  institutionsRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    param('institutionId').isUUID().withMessage('Invalid institution ID'),
    body('userId').isUUID().withMessage('Invalid user ID'),
  ],
  handleValidationErrors,
  institutionsController.assignAdmin.bind(institutionsController)
);

/**
 * @openapi
 * /institutions/{institutionId}/stats:
 *   get:
 *     tags:
 *       - Institutions
 *     summary: Get Institution Statistics
 *     description: Returns comprehensive statistics for a specific institution (Super Admin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: institutionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the institution
 *     responses:
 *       '200':
 *         description: Institution statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: 'boolean' }
 *                 data: { type: 'object' }
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
router.get('/:institutionId/stats', 
  institutionsRateLimit,
  clerkAuth, 
  requireSuperAdmin,
  [
    param('institutionId').isUUID().withMessage('Invalid institution ID'),
  ],
  handleValidationErrors,
  institutionsController.getInstitutionStats.bind(institutionsController)
);

export default router;