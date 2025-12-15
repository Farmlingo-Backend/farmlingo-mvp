import { Router } from 'express';
import multer from 'multer';
import { clerkAuth } from '../middlewares/clerk';
import {
  getChatrooms,
  createChatroom,
  getChatroomById,
  updateChatroom,
  deleteChatroom,
  getChatMessages,
  createChatMessage
} from '../controllers/chat.controller';

const router = Router();
const upload = multer();

/**
 * @openapi
 * /chatrooms:
 *   get:
 *     tags:
 *       - Chatrooms
 *     summary: Get all chatrooms
 *     responses:
 *       '200':
 *         description: List of chatrooms.
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Create a chatroom
 *     security:
 *       - clerkAuth: []
 *     responses:
 *       '201':
 *         description: Chatroom created.
 *
 * /chatrooms/{chatroomId}:
 *   get:
 *     tags:
 *       - Chatrooms
 *     summary: Get chatroom by ID
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Chatroom details.
 *   put:
 *     tags:
 *       - Chatrooms
 *     summary: Update chatroom
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Chatroom updated.
 *   delete:
 *     tags:
 *       - Chatrooms
 *     summary: Delete chatroom
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Chatroom deleted.
 *
 * /chatrooms/{chatroomId}/messages:
 *   get:
 *     tags:
 *       - Chatrooms
 *     summary: Get chatroom messages
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: List of messages.
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Send message to chatroom
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Message sent.
 */

export default router;
// Runtime endpoints
router.get('/', getChatrooms);
router.post('/', clerkAuth, upload.none(), createChatroom);
router.get('/:chatroomId', getChatroomById);
router.put('/:chatroomId', clerkAuth, upload.none(), updateChatroom);
router.delete('/:chatroomId', clerkAuth, deleteChatroom);
router.get('/:chatroomId/messages', getChatMessages);
router.post('/:chatroomId/messages', clerkAuth, upload.none(), createChatMessage);
