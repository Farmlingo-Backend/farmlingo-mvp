import { db } from '../db/dbconfig';
import { notifications, chatroom_members, chat_messages, message_read_status } from '../db/schema';
import { eq, and, desc, sql, lt } from 'drizzle-orm';
import { NotificationType } from '../types/chat.types';

export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedChatroomId?: string;
  relatedUserId?: string;
  relatedMessageId?: string;
  metadata?: any;
}

export interface NotificationSummary {
  total: number;
  unread: number;
  byType: Record<string, number>;
}

export class NotificationService {
  /**
   * Create a notification
   */
  async createNotification(data: NotificationData): Promise<string> {
    const [notification] = await db.insert(notifications).values({
      user_id: data.userId,
      type: data.type as any,
      title: data.title,
      message: data.message,
      related_chatroom_id: data.relatedChatroomId,
      related_user_id: data.relatedUserId,
      related_message_id: data.relatedMessageId,
      metadata: data.metadata
    }).returning();

    return notification.notification_id;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ notifications: any[]; total: number }> {
    const userNotifications = await db.select()
      .from(notifications)
      .where(eq(notifications.user_id, userId))
      .orderBy(desc(notifications.created_at))
      .limit(limit)
      .offset(offset);

    const totalCount = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(eq(notifications.user_id, userId));

    return {
      notifications: userNotifications,
      total: totalCount[0]?.count || 0
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await db.update(notifications)
      .set({
        is_read: true,
        read_at: new Date()
      })
      .where(and(
        eq(notifications.notification_id, notificationId),
        eq(notifications.user_id, userId)
      ));
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<void> {
    await db.update(notifications)
      .set({
        is_read: true,
        read_at: new Date()
      })
      .where(and(
        eq(notifications.user_id, userId),
        eq(notifications.is_read, false)
      ));
  }

  /**
   * Get notification summary for user
   */
  async getNotificationSummary(userId: string): Promise<NotificationSummary> {
    const total = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(eq(notifications.user_id, userId));

    const unread = await db.select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(
        eq(notifications.user_id, userId),
        eq(notifications.is_read, false)
      ));

    // Get count by type
    const byTypeResult = await db.select({
      type: notifications.type,
      count: sql<number>`count(*)`
    })
    .from(notifications)
    .where(and(
      eq(notifications.user_id, userId),
      eq(notifications.is_read, false)
    ))
    .groupBy(notifications.type);

    const byType: Record<string, number> = {};
    byTypeResult.forEach(row => {
      byType[row.type as string] = row.count;
    });

    return {
      total: total[0]?.count || 0,
      unread: unread[0]?.count || 0,
      byType
    };
  }

  /**
   * Update unread counts for chatroom members
   */
  async updateUnreadCounts(chatroomId: string): Promise<void> {
    // Get all active members of the chatroom
    const members = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.status, 'active')
      ));

    // Get the latest message in the chatroom
    const [latestMessage] = await db.select()
      .from(chat_messages)
      .where(and(
        eq(chat_messages.chatroom_id, chatroomId),
        eq(chat_messages.is_deleted, false)
      ))
      .orderBy(desc(chat_messages.created_at))
      .limit(1);

    if (!latestMessage) return;

    // For each member, count unread messages
    for (const member of members) {
      const unreadCount = await db.select({ count: sql<number>`count(*)` })
        .from(chat_messages)
        .where(and(
          eq(chat_messages.chatroom_id, chatroomId),
          eq(chat_messages.is_deleted, false),
          lt(chat_messages.created_at, member.last_read_at || new Date(0)),
          sql`${chat_messages.user_id} != ${member.user_id}` // Don't count own messages
        ));

      await db.update(chatroom_members)
        .set({
          unread_count: unreadCount[0]?.count || 0
        })
        .where(eq(chatroom_members.member_id, member.member_id));
    }
  }

  /**
   * Mark messages as read for a user in a chatroom
   */
  async markMessagesAsRead(chatroomId: string, userId: string, messageIds: string[]): Promise<void> {
    const now = new Date();

    // Update message read status
    for (const messageId of messageIds) {
      await db.insert(message_read_status).values({
        message_id: messageId,
        user_id: userId,
        read_at: now,
        delivered_at: now
      }).onConflictDoNothing();
    }

    // Update member's last read time
    await db.update(chatroom_members)
      .set({
        last_read_at: now,
        unread_count: 0
      })
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.user_id, userId)
      ));
  }

  /**
   * Create notification for new message
   */
  async notifyNewMessage(messageId: string, senderId: string): Promise<void> {
    const [message] = await db.select()
      .from(chat_messages)
      .where(eq(chat_messages.message_id, messageId))
      .limit(1);

    if (!message) return;

    // Get all active members except sender
    const members = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, message.chatroom_id),
        eq(chatroom_members.status, 'active'),
        sql`${chatroom_members.user_id} != ${senderId}`
      ));

    // Create notifications for each member
    const notificationData = members.map(member => ({
      user_id: member.user_id,
      type: 'message' as any,
      title: 'New Message',
      message: `You have a new message in ${message.chatroom_id}`,
      related_chatroom_id: message.chatroom_id,
      related_message_id: message.message_id,
      related_user_id: senderId
    }));

    if (notificationData.length > 0) {
      await db.insert(notifications).values(notificationData);
    }
  }

  /**
   * Create notification for member activity
   */
  async notifyMemberActivity(
    chatroomId: string,
    activityType: 'join' | 'leave' | 'added' | 'removed',
    affectedUserId: string,
    performedBy?: string
  ): Promise<void> {
    // Get all active members except the affected user
    const members = await db.select()
      .from(chatroom_members)
      .where(and(
        eq(chatroom_members.chatroom_id, chatroomId),
        eq(chatroom_members.status, 'active'),
        sql`${chatroom_members.user_id} != ${affectedUserId}`
      ));

    const activityMessages = {
      join: 'joined the chatroom',
      leave: 'left the chatroom',
      added: 'was added to the chatroom',
      removed: 'was removed from the chatroom'
    };

    const notificationData = members.map(member => ({
      user_id: member.user_id,
      type: `member_${activityType}` as any,
      title: 'Member Activity',
      message: `A member ${activityMessages[activityType]}`,
      related_chatroom_id: chatroomId,
      related_user_id: affectedUserId
    }));

    if (notificationData.length > 0) {
      await db.insert(notifications).values(notificationData);
    }
  }

  /**
   * Clean up old notifications (older than 30 days)
   */
  async cleanupOldNotifications(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db.delete(notifications)
      .where(sql`${notifications.created_at} < ${cutoffDate} AND ${notifications.is_read} = true`);

    return result.rowCount || 0;
  }
}

export const notificationService = new NotificationService();
