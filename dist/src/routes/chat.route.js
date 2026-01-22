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
 *   get:
 *     tags:
 *       - Chatrooms
 *     summary: Get message reactions
 *     description: Retrieve all reactions for a specific message.
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
 *         description: The ID of the message
 *     responses:
 *       '200':
 *         description: Reactions retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MessageReaction'
 *                 count:
 *                   type: integer
 *                   description: Total number of reactions
 *   delete:
 *     tags:
 *       - Chatrooms
 *     summary: Remove message reaction
 *     description: Remove a specific reaction from a message.
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
 *         description: The ID of the message
 *       - in: query
 *         name: emoji
 *         required: true
 *         schema:
 *           type: string
 *         description: The emoji to remove
 *     responses:
 *       '200':
 *         description: Reaction removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '403':
 *         description: Forbidden - Not authorized to remove this reaction.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Reaction not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'

 * /chatrooms/{chatroomId}/messages/{messageId}/attachments:
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Upload message attachment
 *     description: Upload a file attachment to a message.
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
 *         description: The ID of the message to attach to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               attachment_type:
 *                 type: string
 *                 enum: [image, video, audio, document, other]
 *                 default: other
 *                 description: Type of attachment
 *     responses:
 *       '201':
 *         description: Attachment uploaded successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 file_url:
 *                   type: string
 *                   description: URL to access the uploaded file
 *       '400':
 *         description: Bad request - Invalid file or missing parameters.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Not authorized to upload attachments.
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
 *   get:
 *     tags:
 *       - Chatrooms
 *     summary: Get message attachments
 *     description: Retrieve all attachments for a specific message.
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
 *         description: The ID of the message
 *     responses:
 *       '200':
 *         description: Attachments retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       attachment_id:
 *                         type: string
 *                         format: uuid
 *                       file_url:
 *                         type: string
 *                       file_name:
 *                         type: string
 *                       file_type:
 *                         type: string
 *                       file_size:
 *                         type: integer
 *                       attachment_type:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                 count:
 *                   type: integer
 *                   description: Total number of attachments
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
 *
 * /chatrooms/{chatroomId}/members:
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Add a member to chatroom
 *     description: Add a new member to the chatroom (Admin only).
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
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to add
 *               role:
 *                 type: string
 *                 enum: [admin, moderator, member]
 *                 default: member
 *                 description: Role of the new member
 *     responses:
 *       '201':
 *         description: Member added successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatroomMember'
 *       '400':
 *         description: Bad request - Invalid input data or user already member.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Not authorized to add members.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *   get:
 *     tags:
 *       - Chatrooms
 *     summary: Get chatroom members
 *     description: Retrieve list of active members in a chatroom.
 *     parameters:
 *       - in: path
 *         name: chatroomId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the chatroom
 *     responses:
 *       '200':
 *         description: Members retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ChatroomMember'
 *
 * /chatrooms/{chatroomId}/invite:
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Invite a user to chatroom
 *     description: Send an invitation to a user or email (Admin only).
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
 *             properties:
 *               user_id:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to invite
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email to invite
 *               message:
 *                 type: string
 *                 description: Optional invitation message
 *     responses:
 *       '201':
 *         description: Invitation sent successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatroomInvitation'
 *       '400':
 *         description: Bad request - Invalid input or user already invited/member.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Not authorized to invite members.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/{chatroomId}/join:
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Request to join chatroom
 *     description: Submit a join request for a chatroom that requires approval.
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Optional message with the request
 *     responses:
 *       '201':
 *         description: Join request submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MembershipRequest'
 *       '400':
 *         description: Bad request - Already member or pending request.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Banned from chatroom.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/{chatroomId}/requests/{requestId}/approve:
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Approve join request
 *     description: Approve a pending join request (Admin only).
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
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the join request
 *     responses:
 *       '200':
 *         description: Request approved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '403':
 *         description: Forbidden - Not authorized to approve requests.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Request not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/{chatroomId}/requests/{requestId}/reject:
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Reject join request
 *     description: Reject a pending join request (Admin only).
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
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the join request
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Optional rejection reason
 *     responses:
 *       '200':
 *         description: Request rejected successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '403':
 *         description: Forbidden - Not authorized to reject requests.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Request not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/{chatroomId}/members/{userId}:
 *   delete:
 *     tags:
 *       - Chatrooms
 *     summary: Remove member from chatroom
 *     description: Remove a member from the chatroom (Admin only).
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
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to remove
 *     responses:
 *       '200':
 *         description: Member removed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '403':
 *         description: Forbidden - Not authorized to remove members.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Member not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *
 * /chatrooms/{chatroomId}/members/{userId}/role:
 *   put:
 *     tags:
 *       - Chatrooms
 *     summary: Change member role
 *     description: Change the role of a chatroom member (Admin only).
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
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user whose role to change
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, moderator, member]
 *                 description: New role for the member
 *     responses:
 *       '200':
 *         description: Role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '400':
 *         description: Bad request - Invalid role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Not authorized to change roles.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Member not found.
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
router.get('/:chatroomId/members', chat_controller_1.getChatroomMembers);
router.post('/:chatroomId/members', clerk_1.clerkAuth, upload.none(), chat_controller_1.addChatroomMember);
router.post('/:chatroomId/invite', clerk_1.clerkAuth, upload.none(), chat_controller_1.inviteMember);
router.post('/:chatroomId/join', clerk_1.clerkAuth, upload.none(), chat_controller_1.requestJoin);
router.post('/:chatroomId/requests/:requestId/approve', clerk_1.clerkAuth, upload.none(), chat_controller_1.approveJoinRequest);
router.post('/:chatroomId/requests/:requestId/reject', clerk_1.clerkAuth, upload.none(), chat_controller_1.rejectJoinRequest);
router.delete('/:chatroomId/members/:userId', clerk_1.clerkAuth, chat_controller_1.removeChatroomMember);
router.put('/:chatroomId/members/:userId/role', clerk_1.clerkAuth, upload.none(), chat_controller_1.changeMemberRole);
router.get('/:chatroomId/messages', chat_controller_1.getChatMessages);
router.post('/:chatroomId/messages', clerk_1.clerkAuth, upload.none(), chat_controller_1.createChatMessage);
// Message management endpoints
router.put('/:chatroomId/messages/:messageId', clerk_1.clerkAuth, chat_controller_1.updateChatMessage);
router.delete('/:chatroomId/messages/:messageId', clerk_1.clerkAuth, chat_controller_1.deleteChatMessage);
router.post('/:chatroomId/messages/:messageId/reactions', clerk_1.clerkAuth, chat_controller_1.addMessageReaction);
router.get('/:chatroomId/messages/:messageId/reactions', chat_controller_1.getMessageReactions);
router.delete('/:chatroomId/messages/:messageId/reactions', clerk_1.clerkAuth, chat_controller_1.removeMessageReaction);
router.get('/:chatroomId/search', clerk_1.clerkAuth, chat_controller_1.searchMessages);
router.get('/:chatroomId/history', clerk_1.clerkAuth, chat_controller_1.getMessageHistory);
router.delete('/:chatroomId/clear-history', clerk_1.clerkAuth, chat_controller_1.clearChatHistory);
// Admin endpoints
router.get('/admin/all', clerk_1.clerkAuth, chat_controller_1.getAllChatroomsAdmin);
router.get('/admin/messages/all', clerk_1.clerkAuth, chat_controller_1.getAllChatMessagesAdmin);
