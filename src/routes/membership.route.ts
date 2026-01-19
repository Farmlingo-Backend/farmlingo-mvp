import { Router } from 'express';
import { authenticate } from '../middlewares/auth';
import { clerkAuth } from '../middlewares/clerk';
import {
  requestMembership,
  reviewMembershipRequest,
  inviteUser,
  acceptInvitation,
  removeMember,
  getPendingRequests,
  getChatroomMembers,
  leaveChatroom
} from '../controllers/membership.controller';

const router = Router();

/**
 * @openapi
 * /chatrooms/{chatroomId}/members/request:
 *   post:
 *     tags:
 *       - Membership
 *     summary: Request to join a chatroom
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
 *       required: false
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
 *         description: Membership request submitted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MembershipRequest'
 *       '400':
 *         description: Bad request - Invalid input data.
 *       '403':
 *         description: Forbidden - Not authorized.
 *
 * /chatrooms/{chatroomId}/members/requests/{requestId}/review:
 *   post:
 *     tags:
 *       - Membership
 *     summary: Approve or reject a membership request
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
 *         description: The ID of the membership request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - approved
 *             properties:
 *               approved:
 *                 type: boolean
 *                 description: Whether to approve or reject the request
 *               responseMessage:
 *                 type: string
 *                 description: Optional response message
 *     responses:
 *       '200':
 *         description: Request reviewed successfully.
 *       '403':
 *         description: Forbidden - Not authorized to review requests.
 *       '404':
 *         description: Request not found.
 *
 * /chatrooms/{chatroomId}/members/invite:
 *   post:
 *     tags:
 *       - Membership
 *     summary: Invite a user to join a chatroom
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
 *               invitedUserId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to invite
 *               invitedEmail:
 *                 type: string
 *                 format: email
 *                 description: Email of the user to invite (alternative to userId)
 *               message:
 *                 type: string
 *                 description: Optional invitation message
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *                 description: Optional expiration date for the invitation
 *             oneOf:
 *               - required: [invitedUserId]
 *               - required: [invitedEmail]
 *     responses:
 *       '201':
 *         description: Invitation sent successfully.
 *       '403':
 *         description: Forbidden - Not authorized to invite users.
 *
 * /invitations/{invitationCode}/accept:
 *   post:
 *     tags:
 *       - Membership
 *     summary: Accept an invitation to join a chatroom
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: invitationCode
 *         required: true
 *         schema:
 *           type: string
 *         description: The invitation code
 *     responses:
 *       '200':
 *         description: Invitation accepted successfully.
 *       '400':
 *         description: Invalid or expired invitation.
 *       '403':
 *         description: Forbidden - Not authorized.
 *
 * /chatrooms/{chatroomId}/members:
 *   get:
 *     tags:
 *       - Membership
 *     summary: Get chatroom members
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
 *     responses:
 *       '200':
 *         description: Members retrieved successfully.
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
 *                     $ref: '#/components/schemas/ChatroomMember'
 *       '403':
 *         description: Forbidden - Not a member of this chatroom.
 *
 * /chatrooms/{chatroomId}/members/requests:
 *   get:
 *     tags:
 *       - Membership
 *     summary: Get pending membership requests
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
 *     responses:
 *       '200':
 *         description: Pending requests retrieved successfully.
 *       '403':
 *         description: Forbidden - Not authorized to view requests.
 *
 * /chatrooms/{chatroomId}/members/{userId}:
 *   delete:
 *     tags:
 *       - Membership
 *     summary: Remove a member from chatroom
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Optional reason for removal
 *     responses:
 *       '200':
 *         description: Member removed successfully.
 *       '403':
 *         description: Forbidden - Not authorized to remove members.
 *       '404':
 *         description: Member not found.
 *
 * /chatrooms/{chatroomId}/leave:
 *   post:
 *     tags:
 *       - Membership
 *     summary: Leave a chatroom
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
 *     responses:
 *       '200':
 *         description: Successfully left the chatroom.
 *       '403':
 *         description: Forbidden - Not a member of this chatroom.
 */

// Membership management routes
router.post('/:chatroomId/members/request', clerkAuth, requestMembership);
router.post('/:chatroomId/members/requests/:requestId/review', clerkAuth, reviewMembershipRequest);
router.post('/:chatroomId/members/invite', clerkAuth, inviteUser);
router.post('/invitations/:invitationCode/accept', clerkAuth, acceptInvitation);
router.get('/:chatroomId/members', clerkAuth, getChatroomMembers);
router.get('/:chatroomId/members/requests', clerkAuth, getPendingRequests);
router.delete('/:chatroomId/members/:userId', clerkAuth, removeMember);
router.post('/:chatroomId/leave', clerkAuth, leaveChatroom);

export default router;