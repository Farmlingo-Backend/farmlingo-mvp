import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth';
import { clerkAuth } from '../middlewares/clerk';
import {
  getChatrooms,
  createChatroom,
  getChatroomById,
  updateChatroom,
  deleteChatroom,
  getChatMessages,
  createChatMessage,
  updateChatMessage,
  deleteChatMessage,
  addMessageReaction,
  searchMessages,
  getMessageHistory,
  clearChatHistory,
  getAllChatroomsAdmin,
  getAllChatMessagesAdmin,
  addChatroomMember,
  getChatroomMembers,
  inviteMember,
  requestJoin,
  approveJoinRequest,
  rejectJoinRequest,
  removeChatroomMember,
  changeMemberRole
} from '../controllers/chat.controller';

const router = Router();
const upload = multer({ dest: 'uploads/chat/' });

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
 *
 * /chatrooms/{chatroomId}/members:
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

export default router;
// Runtime endpoints
router.get('/', getChatrooms);
router.post('/', clerkAuth, upload.none(), createChatroom);
router.get('/:chatroomId', getChatroomById);
router.put('/:chatroomId', clerkAuth, upload.none(), updateChatroom);
router.delete('/:chatroomId', clerkAuth, deleteChatroom);
router.get('/:chatroomId/members', getChatroomMembers);
router.post('/:chatroomId/members', clerkAuth, upload.none(), addChatroomMember);
router.post('/:chatroomId/invite', clerkAuth, upload.none(), inviteMember);
router.post('/:chatroomId/join', clerkAuth, upload.none(), requestJoin);
router.post('/:chatroomId/requests/:requestId/approve', clerkAuth, upload.none(), approveJoinRequest);
router.post('/:chatroomId/requests/:requestId/reject', clerkAuth, upload.none(), rejectJoinRequest);
router.delete('/:chatroomId/members/:userId', clerkAuth, removeChatroomMember);
router.put('/:chatroomId/members/:userId/role', clerkAuth, upload.none(), changeMemberRole);
router.get('/:chatroomId/messages', getChatMessages);
router.post('/:chatroomId/messages', clerkAuth, upload.none(), createChatMessage);

// Message management endpoints
router.put('/:chatroomId/messages/:messageId', clerkAuth, updateChatMessage);
router.delete('/:chatroomId/messages/:messageId', clerkAuth, deleteChatMessage);
router.post('/:chatroomId/messages/:messageId/reactions', clerkAuth, addMessageReaction);
router.get('/:chatroomId/search', clerkAuth, searchMessages);
router.get('/:chatroomId/history', clerkAuth, getMessageHistory);
router.delete('/:chatroomId/clear-history', clerkAuth, clearChatHistory);

// Admin endpoints
router.get('/admin/all', clerkAuth, getAllChatroomsAdmin);
router.get('/admin/messages/all', clerkAuth, getAllChatMessagesAdmin);
