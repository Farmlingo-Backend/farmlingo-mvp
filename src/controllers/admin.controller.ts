import { Request, Response, NextFunction } from 'express';
import { db } from '../db/dbconfig';
import { users, courses, course_enrollments, forums, chatrooms, chat_messages, announcements } from '../db/schema';
import { sql } from 'drizzle-orm';

interface HttpError extends Error {
  status?: number;
}

const createHttpError = (status: number, message: string): HttpError => {
  const err = new Error(message) as HttpError;
  err.status = status;
  return err;
};

// Admin Dashboard Overview
export const getAdminDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = req.auth;

    if (!auth) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (auth.role !== 'admin' && auth.role !== 'super_admin') {
      return next(createHttpError(403, 'Forbidden: Admin access required'));
    }

    // Get comprehensive dashboard data
    const [
      userStats,
      courseStats,
      enrollmentStats,
      forumStats,
      chatStats,
      announcementStats
    ] = await Promise.all([
      // User statistics
      db.select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(case when ${users.is_active} = true then 1 end)`,
        recent: sql<number>`count(case when ${users.created_at} >= now() - interval '30 days' then 1 end)`
      }).from(users),

      // Course statistics
      db.select({
        total: sql<number>`count(*)`,
        published: sql<number>`count(case when ${courses.status} = 'published' then 1 end)`,
        draft: sql<number>`count(case when ${courses.status} = 'draft' then 1 end)`
      }).from(courses),

      // Enrollment statistics
      db.select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(case when ${course_enrollments.enrollment_status} = 'completed' then 1 end)`,
        inProgress: sql<number>`count(case when ${course_enrollments.enrollment_status} = 'in_progress' then 1 end)`
      }).from(course_enrollments),

      // Forum statistics
      db.select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(case when ${forums.is_active} = true then 1 end)`
      }).from(forums),

      // Chat statistics
      db.select({
        rooms: sql<number>`count(distinct ${chatrooms.chatroom_id})`,
        messages: sql<number>`count(${chat_messages.message_id})`,
        activeRooms: sql<number>`count(case when ${chatrooms.status} = 'active' then 1 end)`
      }).from(chatrooms).leftJoin(chat_messages, sql`${chatrooms.chatroom_id} = ${chat_messages.chatroom_id}`),

      // Announcement statistics
      db.select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(case when ${announcements.is_active} = true then 1 end)`
      }).from(announcements)
    ]);

    // Get recent activities
    const recentActivities = await db
      .select({
        type: sql<string>`'user_registration'`,
        description: sql<string>`concat(${users.first_name}, ' ', ${users.last_name}, ' registered')`,
        created_at: users.created_at,
        user_id: users.user_id
      })
      .from(users)
      .orderBy(sql`${users.created_at} desc`)
      .limit(10);

    // Get system alerts (example: inactive announcements)
    const inactiveAnnouncements = await db
      .select()
      .from(announcements)
      .where(sql`${announcements.is_active} = false`)
      .orderBy(sql`${announcements.updated_at} desc`)
      .limit(5);

    res.status(200).json({
      overview: {
        users: userStats[0],
        courses: courseStats[0],
        enrollments: enrollmentStats[0],
        forums: forumStats[0],
        chat: chatStats[0],
        announcements: announcementStats[0]
      },
      recentActivities,
      alerts: {
        inactiveAnnouncements,
        systemStatus: 'healthy'
      },
      quickActions: [
        { action: 'create_announcement', label: 'Create Announcement', endpoint: '/announcements' },
        { action: 'manage_users', label: 'Manage Users', endpoint: '/admin/users' },
        { action: 'view_reports', label: 'View Reports', endpoint: '/admin/reports' },
        { action: 'system_health', label: 'System Health', endpoint: '/admin/system/health' }
      ]
    });
  } catch (err) {
    next(err as Error);
  }
};

// Admin Reports
export const getAdminReports = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = req.auth;

    if (!auth) {
      return next(createHttpError(401, 'Unauthorized'));
    }

    if (auth.role !== 'admin' && auth.role !== 'super_admin') {
      return next(createHttpError(403, 'Forbidden: Admin access required'));
    }

    // Generate various reports
    const userGrowth = await db.execute(sql`
      SELECT
        date_trunc('month', created_at) as month,
        count(*) as new_users
      FROM users
      WHERE created_at >= now() - interval '12 months'
      GROUP BY month
      ORDER BY month
    `);

    const coursePopularity = await db.execute(sql`
      SELECT
        c.title,
        count(e.enrollment_id) as enrollment_count
      FROM courses c
      LEFT JOIN course_enrollments e ON c.course_id = e.course_id
      GROUP BY c.course_id, c.title
      ORDER BY enrollment_count DESC
      LIMIT 10
    `);

    const forumActivity = await db.execute(sql`
      SELECT
        f.name,
        f.post_count,
        f.member_count
      FROM forums f
      WHERE f.is_active = true
      ORDER BY f.post_count DESC
      LIMIT 10
    `);

    res.status(200).json({
      userGrowth,
      coursePopularity,
      forumActivity,
      generatedAt: new Date().toISOString()
    });
  } catch (err) {
    next(err as Error);
  }
};
