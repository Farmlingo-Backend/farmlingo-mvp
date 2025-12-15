"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middlewares/auth");
const chat_controller_1 = require("../controllers/chat.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
/**
 * @openapi
 * /chatrooms:
 *   get:
 *     tags:
 *       - Chat
 *     summary: List all chat rooms
 *     description: Returns a paginated list of all chat rooms.
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
 *           default: 10
 *         description: Number of chat rooms per page
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter chat rooms by course ID
 *     responses:
 *       '200':
 *         description: A list of chat rooms.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 *   post:
 *     tags:
 *       - Chat
 *     summary: Create a new chat room
 *     description: Creates a new chat room with the provided details.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewChatroom'
 *     responses:
 *       '201':
 *         description: Chat room created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chatroom'
 *       '400':
 *         description: Bad request - Invalid input data.
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
/**
 * @openapi
 * /chatrooms/{chatroomId}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get a specific chat room
 *     description: Returns details of a specific chat room by ID.
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chat room to retrieve
 *     responses:
 *       '200':
 *         description: Chat room details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chatroom'
 *       '404':
 *         description: Chat room not found.
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
 *
 *   put:
 *     tags:
 *       - Chat
 *     summary: Update a chat room
 *     description: Updates an existing chat room with new details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chat room to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewChatroom'
 *     responses:
 *       '200':
 *         description: Chat room updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Chatroom'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Chat room not found.
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
 *
 *   delete:
 *     tags:
 *       - Chat
 *     summary: Delete a chat room
 *     description: Deletes a chat room by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chat room to delete
 *     responses:
 *       '204':
 *         description: Chat room deleted successfully.
 *       '404':
 *         description: Chat room not found.
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
/**
 * @openapi
 * /chatrooms/{chatroomId}/messages:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get chat messages
 *     description: Returns a paginated list of messages in a specific chat room.
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chat room
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
 *       - in: query
 *         name: before
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Get messages sent before this timestamp
 *     responses:
 *       '200':
 *         description: A list of chat messages.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       '404':
 *         description: Chat room not found.
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
 *
 *   post:
 *     tags:
 *       - Chat
 *     summary: Send a chat message
 *     description: Sends a new message to a chat room.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chat room
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewChatMessage'
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
 *       '404':
 *         description: Chat room not found.
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
exports.default = router;
// Runtime endpoints
router.get('/', chat_controller_1.getChatrooms);
router.post('/', auth_1.authenticate, upload.none(), chat_controller_1.createChatroom);
router.get('/:chatroomId', chat_controller_1.getChatroomById);
router.put('/:chatroomId', auth_1.authenticate, upload.none(), chat_controller_1.updateChatroom);
router.delete('/:chatroomId', auth_1.authenticate, chat_controller_1.deleteChatroom);
router.get('/:chatroomId/messages', chat_controller_1.getChatMessages);
router.post('/:chatroomId/messages', auth_1.authenticate, upload.none(), chat_controller_1.createChatMessage);
