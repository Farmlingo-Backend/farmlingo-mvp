import { db } from '../db/dbconfig';
import { users, courses, course_enrollments, lessons, forums, chatrooms, chat_messages, announcements } from '../db/schema';
import { sql, desc, asc, eq } from 'drizzle-orm';
import { websocketService } from './websocket.service';

interface RealTimeMetrics {
  activeUsers: number;
  onlineUsers: number;
  activeChats: number;
  messagesPerHour: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  databaseConnections: number;
  memoryUsage: number;
  responseTime: number;
  errorRate: number;
}

interface UserBehaviorAnalytics {
  dailyActiveUsers: number[];
  userRetention: number;
  sessionDuration: number;
  popularFeatures: Array<{ feature: string; usage: number }>;
  userEngagement: {
    averageSessionTime: number;
    pagesPerSession: number;
    bounceRate: number;
  };
}

interface ContentPerformanceAnalytics {
  courseCompletionRates: Array<{ courseId: string; completionRate: number }>;
  lessonEngagement: Array<{ lessonId: string; averageTime: number; completionRate: number }>;
  forumActivity: { totalPosts: number; activeUsers: number; averageResponseTime: number };
  chatActivity: { totalMessages: number; activeRooms: number; averageMessagesPerRoom: number };
}

interface RevenueAnalytics {
  totalRevenue: number;
  monthlyRevenue: number[];
  topCourses: Array<{ courseId: string; revenue: number; enrollments: number }>;
  conversionRate: number;
}

export class AdminAnalyticsService {
  private metricsCache: Map<string, { data: any; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get real-time system metrics
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const cacheKey = 'realtime_metrics';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [
        activeUsers,
        onlineUsers,
        activeChats,
        messagesPerHour,
        systemHealth,
        databaseStats
      ] = await Promise.all([
        this.getActiveUsersLast24h(),
        this.getOnlineUsers(),
        this.getActiveChats(),
        this.getMessagesPerHour(),
        this.checkSystemHealth(),
        this.getDatabaseStats()
      ]);

      const metrics: RealTimeMetrics = {
        activeUsers,
        onlineUsers,
        activeChats,
        messagesPerHour,
        systemHealth,
        databaseConnections: databaseStats.connections,
        memoryUsage: databaseStats.memoryUsage,
        responseTime: await this.measureResponseTime(),
        errorRate: await this.calculateErrorRate()
      };

      this.setCachedData(cacheKey, metrics);
      return metrics;
    } catch (error) {
      console.error('Error getting real-time metrics:', error);
      return {
        activeUsers: 0,
        onlineUsers: 0,
        activeChats: 0,
        messagesPerHour: 0,
        systemHealth: 'critical',
        databaseConnections: 0,
        memoryUsage: 0,
        responseTime: 0,
        errorRate: 0
      };
    }
  }

  /**
   * Get advanced analytics reports
   */
  async getAdvancedReports(filters: {
    dateRange?: { start: Date; end: Date };
    userSegment?: string;
    contentType?: string;
  }): Promise<{
    userBehavior: UserBehaviorAnalytics;
    contentPerformance: ContentPerformanceAnalytics;
    revenueAnalytics: RevenueAnalytics;
    generatedAt: Date;
  }> {
    const cacheKey = `advanced_reports_${JSON.stringify(filters)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const [
        userBehavior,
        contentPerformance,
        revenueAnalytics
      ] = await Promise.all([
        this.analyzeUserBehavior(filters),
        this.analyzeContentPerformance(filters),
        this.generateRevenueAnalytics(filters)
      ]);

      const report = {
        userBehavior,
        contentPerformance,
        revenueAnalytics,
        generatedAt: new Date()
      };

      this.setCachedData(cacheKey, report);
      return report;
    } catch (error) {
      console.error('Error generating advanced reports:', error);
      throw error;
    }
  }

  /**
   * Get active users in the last 24 hours
   */
  private async getActiveUsersLast24h(): Promise<number> {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const result = await db.select({ count: sql<number>`count(distinct user_id)` })
      .from(chat_messages)
      .where(sql`${chat_messages.created_at} >= ${twentyFourHoursAgo}`);

    return result[0]?.count || 0;
  }

  /**
   * Get online users count
   */
  private async getOnlineUsers(): Promise<number> {
    return websocketService.getOnlineUsersCount();
  }

  /**
   * Get active chat rooms
   */
  private async getActiveChats(): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await db.select({ count: sql<number>`count(*)` })
      .from(chatrooms)
      .where(sql`${chatrooms.last_activity} >= ${oneHourAgo} AND ${chatrooms.status} = 'active'`);

    return result[0]?.count || 0;
  }

  /**
   * Get messages per hour
   */
  private async getMessagesPerHour(): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const result = await db.select({ count: sql<number>`count(*)` })
      .from(chat_messages)
      .where(sql`${chat_messages.created_at} >= ${oneHourAgo}`);

    const messageCount = result[0]?.count || 0;
    return Math.round(messageCount); // Messages in the last hour
  }

  /**
   * Check system health
   */
  private async checkSystemHealth(): Promise<'healthy' | 'warning' | 'critical'> {
    try {
      // Check database connectivity
      await db.execute(sql`SELECT 1`);

      // Check response time
      const responseTime = await this.measureResponseTime();
      if (responseTime > 5000) return 'critical';
      if (responseTime > 2000) return 'warning';

      // Check error rate
      const errorRate = await this.calculateErrorRate();
      if (errorRate > 0.1) return 'critical';
      if (errorRate > 0.05) return 'warning';

      return 'healthy';
    } catch (error) {
      return 'critical';
    }
  }

  /**
   * Get database statistics
   */
  private async getDatabaseStats(): Promise<{ connections: number; memoryUsage: number }> {
    try {
      // This is a simplified version - in production you'd use actual DB monitoring
      const connections = await db.select({ count: sql<number>`count(*)` })
        .from(users)
        .limit(1);

      return {
        connections: 1, // Simplified
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024 // MB
      };
    } catch (error) {
      return { connections: 0, memoryUsage: 0 };
    }
  }

  /**
   * Measure average response time
   */
  private async measureResponseTime(): Promise<number> {
    const start = Date.now();
    try {
      await db.select({ count: sql<number>`count(*)` }).from(users).limit(1);
      return Date.now() - start;
    } catch (error) {
      return 9999; // Very slow response
    }
  }

  /**
   * Calculate error rate (simplified)
   */
  private async calculateErrorRate(): Promise<number> {
    // In a real implementation, you'd track actual errors
    // For now, return a low error rate
    return 0.01;
  }

  /**
   * Analyze user behavior
   */
  private async analyzeUserBehavior(filters: any): Promise<UserBehaviorAnalytics> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Daily active users for the last 30 days
    const dailyActiveUsers = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

      const result = await db.select({ count: sql<number>`count(distinct ${chat_messages.user_id})` })
        .from(chat_messages)
        .where(sql`${chat_messages.created_at} >= ${date} AND ${chat_messages.created_at} < ${nextDate}`);

      dailyActiveUsers.push(result[0]?.count || 0);
    }

    return {
      dailyActiveUsers,
      userRetention: 0.75, // Placeholder
      sessionDuration: 1800, // 30 minutes placeholder
      popularFeatures: [
        { feature: 'chat', usage: 85 },
        { feature: 'courses', usage: 70 },
        { feature: 'forums', usage: 45 },
        { feature: 'quizzes', usage: 30 }
      ],
      userEngagement: {
        averageSessionTime: 1800,
        pagesPerSession: 5.2,
        bounceRate: 0.25
      }
    };
  }

  /**
   * Analyze content performance
   */
  private async analyzeContentPerformance(filters: any): Promise<ContentPerformanceAnalytics> {
    // Course completion rates
    const courseCompletionRates = await db.select({
      courseId: course_enrollments.course_id,
      completionRate: sql<number>`avg(case when ${course_enrollments.enrollment_status} = 'completed' then 1 else 0 end)`
    })
    .from(course_enrollments)
    .groupBy(course_enrollments.course_id);

    // Forum activity
    const forumStats = await db.select({
      totalPosts: sql<number>`count(*)`,
      activeUsers: sql<number>`count(distinct user_id)`
    })
    .from(forums)
    .leftJoin(course_enrollments, sql`true`) // Simplified join
    .limit(1);

    // Chat activity
    const chatStats = await db.select({
      totalMessages: sql<number>`count(${chat_messages.message_id})`,
      activeRooms: sql<number>`count(distinct ${chatrooms.chatroom_id})`
    })
    .from(chatrooms)
    .leftJoin(chat_messages, eq(chatrooms.chatroom_id, chat_messages.chatroom_id))
    .where(sql`${chatrooms.status} = 'active'`);

    return {
      courseCompletionRates: courseCompletionRates.map(c => ({
        courseId: c.courseId,
        completionRate: c.completionRate
      })),
      lessonEngagement: [], // Placeholder
      forumActivity: {
        totalPosts: forumStats[0]?.totalPosts || 0,
        activeUsers: forumStats[0]?.activeUsers || 0,
        averageResponseTime: 3600 // 1 hour placeholder
      },
      chatActivity: {
        totalMessages: chatStats[0]?.totalMessages || 0,
        activeRooms: chatStats[0]?.activeRooms || 0,
        averageMessagesPerRoom: chatStats[0]?.activeRooms ?
          (chatStats[0].totalMessages / chatStats[0].activeRooms) : 0
      }
    };
  }

  /**
   * Generate revenue analytics (placeholder)
   */
  private async generateRevenueAnalytics(filters: any): Promise<RevenueAnalytics> {
    // This would integrate with actual payment systems
    return {
      totalRevenue: 0,
      monthlyRevenue: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 12 months
      topCourses: [],
      conversionRate: 0
    };
  }

  /**
   * Cache management
   */
  private getCachedData(key: string): any | null {
    const cached = this.metricsCache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private setCachedData(key: string, data: any): void {
    this.metricsCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.metricsCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number } {
    return {
      size: this.metricsCache.size,
      hitRate: 0.85 // Placeholder
    };
  }
}

export const adminAnalyticsService = new AdminAnalyticsService();
