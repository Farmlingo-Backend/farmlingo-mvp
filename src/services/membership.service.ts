import { db } from '../db/dbconfig';
import {
  chatroom_members,
  membership_requests,
  membership_logs,
  chatroom_invitations,
  chatrooms,
  notifications,
  NewChatroomMember,
  NewMembershipRequest,
  NewMembershipLog,
  NewChatroomInvitation,
  NewNotification
} from '../db/schema';
import { ChatMemberRole, ChatMemberStatus, MembershipAction, MembershipRequestStatus, NotificationType, InvitationStatus } from '../types/chat.types';
import { eq, and, sql } from 'drizzle-orm';
import { randomBytes } from 'crypto';

export interface MembershipRequestData {
  chatroomId: string;
  userId: string;
  message?: string;
  requestedBy?: string;
}

export interface InvitationData {
  chatroomId: string;
  invitedUserId?: string;
  invitedEmail?: string;
  invitedBy: string;
  message?: string;
  expiresAt?: Date;
}

export interface MemberOperationResult {
  success: boolean;
  message: string;
  memberId?: string;
}

export class MembershipService {
  /**
   * Request to join a chatroom
   */
  async requestMembership(data: MembershipRequestData): Promise<MembershipRequestData & { requestId: string }> {
    const { chatroomId, userId, message, requestedBy } = data;

    // Check if user is already a member
    const existingMember = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.user_id, userId),
        eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
      ))
      .limit(1);

    if (existingMember.length > 0) {
      throw new Error('User is already a member of this chatroom');
    }

    // Check if there's already a pending request
    const existingRequest = await db.select()
      .from(membership_requests)
      .where(and(
        eq(membership_requests.chatroom_id, chatroomId),
        eq(membership_requests.user_id, userId),
        eq(membership_requests.status, 'pending')
      ))
      .limit(1);

    if (existingRequest.length > 0) {
      throw new Error('User already has a pending membership request');
    }

    // Check member cap
    await this.checkMemberCap(chatroomId);

    const [request] = await db.insert(membership_requests).values({
      chatroom_id: chatroomId,
      user_id: userId,
      requested_by: requestedBy,
      message: message || null,
      status: 'pending'
    }).returning();

    // Log the request
    await this.logMembershipAction({
      chatroomId,
      userId,
      action: 'join' as any,
      performedBy: requestedBy,
      reason: 'Membership request submitted'
    });

    return {
      chatroomId,
      userId,
      message,
      requestedBy,
      requestId: request.request_id
    };
  }

  /**
   * Approve or reject a membership request
   */
  async reviewMembershipRequest(
    requestId: string,
    reviewerId: string,
    approved: boolean,
    responseMessage?: string
  ): Promise<MemberOperationResult> {
    const request = await db.select()
      .from(membership_requests)
      .where(eq(membership_requests.request_id, requestId))
      .limit(1);

    if (request.length === 0) {
      throw new Error('Membership request not found');
    }

    const membershipRequest = request[0];

    // Check if reviewer has permission (admin or moderator)
    const reviewerMembership = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, membershipRequest.chatroom_id),
        eq(chatroom_members.user_id, reviewerId),
        sql`${chatroom_members.role} IN ('admin', 'moderator')`,
        eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
      ))
      .limit(1);

    if (reviewerMembership.length === 0) {
      throw new Error('Insufficient permissions to review membership requests');
    }

    // Check member cap before approving
    if (approved) {
      await this.checkMemberCap(membershipRequest.chatroom_id);
    }

    const newStatus = approved ? 'approved' as any : 'rejected' as any;

    // Update request status
    await db.update(membership_requests)
      .set({
        status: newStatus,
        reviewed_by: reviewerId,
        reviewed_at: new Date(),
        response_message: responseMessage,
        updated_at: new Date()
      })
      .where(eq(membership_requests.request_id, requestId));

    if (approved) {
      // Add user as member
      const [member] = await db.insert(chatroom_members).values({
        chatroom_id: membershipRequest.chatroom_id,
        user_id: membershipRequest.user_id,
        role: ChatMemberRole.MEMBER,
        invited_by: membershipRequest.requested_by,
        joined_at: new Date(),
        status: ChatMemberStatus.ACTIVE
      }).returning();

      // Update member count
      await this.updateMemberCount(membershipRequest.chatroom_id);

      // Log the approval and join
      await this.logMembershipAction({
        chatroomId: membershipRequest.chatroom_id,
        userId: membershipRequest.user_id,
        action: 'added' as any,
        performedBy: reviewerId,
        reason: 'Membership request approved',
        oldValue: null,
        newValue: { role: ChatMemberRole.MEMBER, status: ChatMemberStatus.ACTIVE }
      });

      // Create notification for the user
      await this.createNotification({
        userId: membershipRequest.user_id,
        type: 'request_approved' as any,
        title: 'Membership Request Approved',
        message: `Your request to join the chatroom has been approved.`,
        relatedChatroomId: membershipRequest.chatroom_id
      });

      return {
        success: true,
        message: 'Membership request approved successfully',
        memberId: member.member_id
      };
    } else {
      // Log the rejection
      await this.logMembershipAction({
        chatroomId: membershipRequest.chatroom_id,
        userId: membershipRequest.user_id,
        action: MembershipAction.JOIN,
        performedBy: reviewerId,
        reason: 'Membership request rejected',
        oldValue: { status: MembershipRequestStatus.PENDING },
        newValue: { status: MembershipRequestStatus.REJECTED }
      });

      // Create notification for the user
      await this.createNotification({
        userId: membershipRequest.user_id,
        type: NotificationType.REQUEST_REJECTED,
        title: 'Membership Request Rejected',
        message: `Your request to join the chatroom has been rejected.${responseMessage ? ` Reason: ${responseMessage}` : ''}`,
        relatedChatroomId: membershipRequest.chatroom_id
      });

      return {
        success: true,
        message: 'Membership request rejected successfully'
      };
    }
  }

  /**
   * Invite a user to join a chatroom
   */
  async inviteUser(data: InvitationData): Promise<{ invitationId: string; invitationCode: string }> {
    const { chatroomId, invitedUserId, invitedEmail, invitedBy, message, expiresAt } = data;

    // Check if inviter has permission
    const inviterMembership = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.user_id, invitedBy),
        sql`${chatroom_members.role} IN ('admin', 'moderator')`,
        eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
      ))
      .limit(1);

    if (inviterMembership.length === 0) {
      throw new Error('Insufficient permissions to invite users');
    }

    // Check member cap
    await this.checkMemberCap(chatroomId);

    // Generate unique invitation code
    const invitationCode = randomBytes(16).toString('hex');

    const [invitation] = await db.insert(chatroom_invitations).values({
      chatroom_id: chatroomId,
      invited_user_id: invitedUserId,
      invited_email: invitedEmail,
      invitation_code: invitationCode,
      invited_by: invitedBy,
      expires_at: expiresAt,
      message: message || null,
      status: InvitationStatus.PENDING
    }).returning();

    // Log the invitation
    await this.logMembershipAction({
      chatroomId,
      userId: invitedUserId || invitedEmail!, // Use email if no user ID
      action: MembershipAction.ADDED,
      performedBy: invitedBy,
      reason: 'User invited to chatroom'
    });

    return {
      invitationId: invitation.invitation_id,
      invitationCode
    };
  }

  /**
   * Accept an invitation
   */
  async acceptInvitation(invitationCode: string, userId: string): Promise<MemberOperationResult> {
    const invitation = await db.select()
      .from(chatroom_invitations)
      .where(and(
        eq(chatroom_invitations.invitation_code, invitationCode),
        eq(chatroom_invitations.status, InvitationStatus.PENDING)
      ))
      .limit(1);

    if (invitation.length === 0) {
      throw new Error('Invalid or expired invitation');
    }

    const invite = invitation[0];

    // Check if invitation is for this user
    if (invite.invited_user_id && invite.invited_user_id !== userId) {
      throw new Error('This invitation is not for you');
    }

    // Check if invitation has expired
    if (invite.expires_at && invite.expires_at < new Date()) {
      await db.update(chatroom_invitations)
        .set({ status: InvitationStatus.EXPIRED })
        .where(eq(chatroom_invitations.invitation_id, invite.invitation_id));

      throw new Error('Invitation has expired');
    }

    // Check if user is already a member
    const existingMember = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, invite.chatroom_id),
        eq(chatroom_members.user_id, userId),
        eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
      ))
      .limit(1);

    if (existingMember.length > 0) {
      throw new Error('You are already a member of this chatroom');
    }

    // Add user as member
    const [member] = await db.insert(chatroom_members).values({
      chatroom_id: invite.chatroom_id,
      user_id: userId,
      role: ChatMemberRole.MEMBER,
      invited_by: invite.invited_by,
      joined_at: new Date(),
      status: ChatMemberStatus.ACTIVE
    }).returning();

    // Update invitation status
    await db.update(chatroom_invitations)
      .set({
        status: InvitationStatus.ACCEPTED,
        accepted_at: new Date(),
        updated_at: new Date()
      })
      .where(eq(chatroom_invitations.invitation_id, invite.invitation_id));

    // Update member count
    await this.updateMemberCount(invite.chatroom_id);

    // Log the join
    await this.logMembershipAction({
      chatroomId: invite.chatroom_id,
      userId,
      action: MembershipAction.JOIN,
      performedBy: invite.invited_by,
      reason: 'Invitation accepted'
    });

    return {
      success: true,
      message: 'Successfully joined the chatroom',
      memberId: member.member_id
    };
  }

  /**
   * Remove a member from chatroom
   */
  async removeMember(chatroomId: string, memberUserId: string, removerUserId: string, reason?: string): Promise<MemberOperationResult> {
    // Check if remover has permission
    const removerMembership = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.user_id, removerUserId),
        sql`${chatroom_members.role} IN ('admin', 'moderator')`,
        eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
      ))
      .limit(1);

    if (removerMembership.length === 0) {
      throw new Error('Insufficient permissions to remove members');
    }

    // Get member to remove
    const memberToRemove = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.user_id, memberUserId),
        eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
      ))
      .limit(1);

    if (memberToRemove.length === 0) {
      throw new Error('Member not found in this chatroom');
    }

    const member = memberToRemove[0];

    // Update member status
    await db.update(chatroom_members)
      .set({
        status: ChatMemberStatus.REMOVED,
        left_at: new Date()
      })
      .where(eq(chatroom_members.member_id, member.member_id));

    // Update member count
    await this.updateMemberCount(chatroomId);

    // Log the removal
    await this.logMembershipAction({
      chatroomId,
      userId: memberUserId,
      action: MembershipAction.REMOVED,
      performedBy: removerUserId,
      reason: reason || 'Removed by admin/moderator',
      oldValue: { role: member.role, status: member.status },
      newValue: { status: ChatMemberStatus.REMOVED }
    });

    // Create notification
    await this.createNotification({
      userId: memberUserId,
      type: NotificationType.MEMBER_REMOVED,
      title: 'Removed from Chatroom',
      message: `You have been removed from the chatroom.`,
      relatedChatroomId: chatroomId
    });

    return {
      success: true,
      message: 'Member removed successfully'
    };
  }

  /**
   * Get pending membership requests for a chatroom
   */
  async getPendingRequests(chatroomId: string, userId: string) {
    // Check if user has permission to view requests
    const userMembership = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.user_id, userId),
        sql`${chatroom_members.role} IN ('admin', 'moderator')`,
        eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
      ))
      .limit(1);

    if (userMembership.length === 0) {
      throw new Error('Insufficient permissions to view membership requests');
    }

    return await db.select()
      .from(membership_requests)
      .where(and(
        eq(membership_requests.chatroom_id, chatroomId),
        eq(membership_requests.status, MembershipRequestStatus.PENDING)
      ))
      .orderBy(membership_requests.created_at);
  }

  /**
   * Get chatroom members
   */
  async getChatroomMembers(chatroomId: string, userId: string) {
    // Check if user is a member
    const userMembership = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.user_id, userId),
        eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
      ))
      .limit(1);

    if (userMembership.length === 0) {
      throw new Error('You are not a member of this chatroom');
    }

    return await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
      ))
      .orderBy(chatroom_members.joined_at);
  }

  /**
   * Check if chatroom has reached member cap
   */
  private async checkMemberCap(chatroomId: string): Promise<void> {
    const chatroom = await db.select()
      .from(chatrooms)
      .where(eq(chatrooms.chatroom_id, chatroomId))
      .limit(1);

    if (chatroom.length === 0) {
      throw new Error('Chatroom not found');
    }

    const room = chatroom[0];
    if (room.max_members && (room.member_count || 0) >= room.max_members) {
      throw new Error('Chatroom has reached maximum member capacity');
    }
  }

  /**
   * Update member count for a chatroom
   */
  private async updateMemberCount(chatroomId: string): Promise<void> {
    const memberCount = await db.select({ count: sql<number>`count(*)` })
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.status, ChatMemberStatus.ACTIVE)
      ));

    await db.update(chatrooms)
      .set({ member_count: memberCount[0]?.count || 0 })
      .where(eq(chatrooms.chatroom_id, chatroomId));
  }

  /**
   * Log membership action
   */
  private async logMembershipAction(data: {
    chatroomId: string;
    userId: string;
    action: MembershipAction;
    performedBy?: string;
    reason?: string;
    oldValue?: any;
    newValue?: any;
  }): Promise<void> {
    await db.insert(membership_logs).values({
      chatroom_id: data.chatroomId,
      user_id: data.userId,
      action: data.action,
      performed_by: data.performedBy,
      reason: data.reason,
      old_value: data.oldValue,
      new_value: data.newValue
    });
  }

  /**
   * Create notification
   */
  private async createNotification(data: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedChatroomId?: string;
    relatedUserId?: string;
    relatedMessageId?: string;
    metadata?: any;
  }): Promise<void> {
    await db.insert(notifications).values({
      user_id: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      related_chatroom_id: data.relatedChatroomId,
      related_user_id: data.relatedUserId,
      related_message_id: data.relatedMessageId,
      metadata: data.metadata
    });
  }
}

export const membershipService = new MembershipService();
