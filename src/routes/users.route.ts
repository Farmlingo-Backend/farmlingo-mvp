import { Router } from 'express';
import {
  syncUser,
  getAuthenticatedUserProfile
} from '../controllers/users.controller';
import { verifyClerkToken, clerkAuth } from '../middlewares/clerk';

const router = Router();

/**
 * @openapi
 * /users/sync:
 *   post:
 *     tags:
 *       - Users
 *     summary: Sync authenticated user profile
 *     description: >
 *       Updates the backend user database with the fresh profile data fetched directly from Clerk.
 *       This endpoint should be called by the frontend immediately after the user signs in (Lazy Sync).
 *       No request body is required as data is fetched server-side using the authenticated token.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile synced successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User synced successfully
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized - Invalid or missing Clerk access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - User ID mismatch.
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
 * */
router.post('/sync', verifyClerkToken, syncUser);

/**
 * @openapi
 * /users/me:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get authenticated user profile
 *     description: Returns the profile of the currently authenticated user using Clerk's access token.
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       '200':
 *         description: Authenticated user profile retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       '400':
 *         description: Invalid request or missing authentication.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '401':
 *         description: Unauthorized - Invalid or missing Clerk access token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - User account is inactive or suspended.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: User not found in database.
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
 * */
router.get('/me', clerkAuth, getAuthenticatedUserProfile);

export default router;
