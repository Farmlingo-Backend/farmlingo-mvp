import { Router } from 'express';
import { handleClerkWebhook } from '../../controllers/webhooks.controller';

const router = Router();

/**
 * @openapi
 * /auth/webhooks/clerk:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Clerk Webhook Endpoint
 *     description: >
 *       Receives webhook events from Clerk when users are created, updated, or deleted.
 *       This endpoint verifies the webhook signature using Svix and automatically syncs
 *       user data with the backend database.
 *
 *       **Important:** This endpoint must be publicly accessible (no authentication required)
 *       as webhooks come from Clerk's servers, not from authenticated users.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Clerk webhook event payload
 *             properties:
 *               type:
 *                 type: string
 *                 description: Event type
 *                 example: user.created
 *                 enum:
 *                   - user.created
 *                   - user.updated
 *                   - user.deleted
 *               data:
 *                 type: object
 *                 description: Event data containing user information
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Clerk user ID
 *                     example: user_2abcdefghijklmnop
 *                   email_addresses:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         email_address:
 *                           type: string
 *                           format: email
 *                           example: john.doe@example.com
 *                   first_name:
 *                     type: string
 *                     example: John
 *                   last_name:
 *                     type: string
 *                     example: Doe
 *                   image_url:
 *                     type: string
 *                     format: uri
 *                     example: https://img.clerk.com/user_abc123
 *                   phone_numbers:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         phone_number:
 *                           type: string
 *                           example: +1234567890
 *     responses:
 *       '200':
 *         description: Webhook processed successfully
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
 *                   example: Webhook processed successfully
 *       '400':
 *         description: Invalid webhook signature or missing required headers
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '500':
 *         description: Server error processing webhook
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *     security: []
 */
router.post('/webhooks/clerk', handleClerkWebhook);

export default router;
