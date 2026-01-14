import { Router } from 'express';
import multer from 'multer';
import {
    createDirectChat,
    getMessages,
    sendMessage
} from '../controllers/chats.controller';
import { clerkAuth } from '../middlewares/clerk';

const router = Router();

/**
 * @openapi
 * /chats/direct:
 *   post:
 *     tags:
 *       - Chats
 *     summary: Create or retrieve a direct chat
 *     description: Creates a new direct chat between two users or returns the existing one.
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId1
 *               - userId2
 *             properties:
 *               userId1:
 *                 type: string
 *                 description: ID of first user
 *               userId2:
 *                 type: string
 *                 description: ID of second user
 *     responses:
 *       '200':
 *         description: Chatroom retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Chatroom'
 */
router.post('/direct', clerkAuth, createDirectChat);

/**
 * @openapi
 * /chats/direct/{chatId}/messages:
 *   get:
 *     tags:
 *       - Chats
 *     summary: Get messages for a chat
 *     description: Returns paginated messages for a specific chat room.
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       '200':
 *         description: Messages retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 */
router.get('/direct/:chatId/messages', clerkAuth, getMessages);

/**
 * @openapi
 * /chats/direct/{chatId}/messages:
 *   post:
 *     tags:
 *       - Chats
 *     summary: Send a message
 *     description: Sends a message to a direct chat room.
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     fileUrl:
 *                       type: string
 *                     fileType:
 *                       type: string
 *                       enum: [image, video, audio, document, pdf]
 *                     fileName:
 *                       type: string
 *                     fileSize:
 *                       type: integer
 *                     mimeType:
 *                       type: string
 *     responses:
 *       '201':
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ChatMessage'
 */
router.post('/direct/:chatId/messages', clerkAuth, sendMessage);

export default router;
