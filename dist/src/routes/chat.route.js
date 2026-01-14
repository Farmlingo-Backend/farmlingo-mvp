"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const clerk_1 = require("../middlewares/clerk");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({ dest: 'uploads/chat/' });
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
 *     description: Retrieve paginated messages from a specific chatroom.
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chatroom
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
 *         description: Number of messages per page
 *     responses:
 *       '200':
 *         description: Messages retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Send message to chatroom
 *     description: Send a new message to a chatroom.
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chatroom
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Message content
 *               message_type:
 *                 type: string
 *                 enum: [text, image, video, audio, file, system]
 *                 default: text
 *                 description: Type of message
 *               reply_to_message_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of message being replied to
 *               metadata:
 *                 type: object
 *                 description: Additional message metadata
 *     responses:
 *       '201':
 *         description: Message sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Not authorized to send messages.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/{chatroomId}/messages/{messageId}:
 *   put:
 *     tags:
 *       - Chatrooms
 *     summary: Edit a message
 *     description: Edit a message in the chatroom (message owner only).
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chatroom
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the message to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: Updated message content
 *     responses:
 *       '200':
 *         description: Message updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Only message owner can edit.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Message not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   delete:
 *     tags:
 *       - Chatrooms
 *     summary: Delete a message
 *     description: Soft delete a message in the chatroom (message owner or admin only).
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chatroom
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the message to delete
 *     responses:
 *       '200':
 *         description: Message deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatMessage'
 *       '403':
 *         description: Forbidden - Only message owner or admin can delete.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Message not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/{chatroomId}/messages/{messageId}/reactions:
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Add message reaction
 *     description: Add an emoji reaction to a message.
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chatroom
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the message to react to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emoji
 *             properties:
 *               emoji:
 *                 type: string
 *                 description: Emoji to add as reaction
 *     responses:
 *       '201':
 *         description: Reaction added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageReaction'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Not authorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Message not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/{chatroomId}/search:
 *   get:
 *     tags:
 *       - Chatrooms
 *     summary: Search messages
 *     description: Search for messages in a chatroom by content.
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chatroom to search in
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of results
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of results to skip
 *     responses:
 *       '200':
 *         description: Search results retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *       '400':
 *         description: Bad request - Search query required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Not authorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/{chatroomId}/history:
 *   get:
 *     tags:
 *       - Chatrooms
 *     summary: Get message history
 *     description: Retrieve messages from a chatroom within a specified time period.
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chatroom
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of days to look back
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of messages to retrieve
 *     responses:
 *       '200':
 *         description: Message history retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 *                 period:
 *                   type: string
 *                   description: Time period description
 *       '403':
 *         description: Forbidden - Not authorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/admin/all:
 *   get:
 *     tags:
 *       - Chatrooms
 *     summary: Get all chatrooms (Admin)
 *     description: Retrieve all chatrooms in the system (Admin only).
 *     security:
 *       - clerkAuth: []
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
 *         description: Number of chatrooms per page
 *     responses:
 *       '200':
 *         description: Chatrooms retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chatroom'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       '403':
 *         description: Forbidden - Admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/admin/messages/all:
 *   get:
 *     tags:
 *       - Chatrooms
 *     summary: Get all messages (Admin)
 *     description: Retrieve all messages in the system (Admin only).
 *     security:
 *       - clerkAuth: []
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
 *         description: Number of messages per page
 *     responses:
 *       '200':
 *         description: Messages retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatMessage'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       '403':
 *         description: Forbidden - Admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
exports.default = router;
// Runtime endpoints
router.get('/', chat_controller_1.getChatrooms);
router.post('/', clerk_1.clerkAuth, upload.none(), chat_controller_1.createChatroom);
router.get('/:chatroomId', chat_controller_1.getChatroomById);
router.put('/:chatroomId', clerk_1.clerkAuth, upload.none(), chat_controller_1.updateChatroom);
router.delete('/:chatroomId', clerk_1.clerkAuth, chat_controller_1.deleteChatroom);
router.get('/:chatroomId/messages', chat_controller_1.getChatMessages);
router.post('/:chatroomId/messages', clerk_1.clerkAuth, upload.none(), chat_controller_1.createChatMessage);
// Message management endpoints
router.put('/:chatroomId/messages/:messageId', clerk_1.clerkAuth, chat_controller_1.updateChatMessage);
router.delete('/:chatroomId/messages/:messageId', clerk_1.clerkAuth, chat_controller_1.deleteChatMessage);
router.post('/:chatroomId/messages/:messageId/reactions', clerk_1.clerkAuth, chat_controller_1.addMessageReaction);
router.get('/:chatroomId/search', clerk_1.clerkAuth, chat_controller_1.searchMessages);
router.get('/:chatroomId/history', clerk_1.clerkAuth, chat_controller_1.getMessageHistory);
// Admin endpoints
router.get('/admin/all', clerk_1.clerkAuth, chat_controller_1.getAllChatroomsAdmin);
router.get('/admin/messages/all', clerk_1.clerkAuth, chat_controller_1.getAllChatMessagesAdmin);
