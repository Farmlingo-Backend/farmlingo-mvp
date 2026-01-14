import { Router, Request, Response } from 'express';
import { clerkAuth } from '../middlewares/clerk';

// Import admin controllers from various modules
import {
  getUsers,
  suspendUser,
  activateUser,
  changeUserRole,
  deleteUserAdmin
} from '../controllers/users.controller';
import { getAllCoursesAdmin } from '../controllers/courses.controller';
import { getAllLessonsAdmin } from '../controllers/lessons.controller';
import { getAllEnrollmentsAdmin } from '../controllers/enrollments.controller';
import { getAllForumsAdmin } from '../controllers/forums.controller';
import { getAllChatroomsAdmin, getAllChatMessagesAdmin } from '../controllers/chat.controller';
import { getAllAnnouncements } from '../controllers/announcements.controller';
import { getAdminDashboard, getAdminReports } from '../controllers/admin.controller';

// Import services for dashboard stats
import { db } from '../db/dbconfig';
import { users, courses, lessons, course_enrollments, forums, chatrooms, chat_messages, announcements } from '../db/schema';
import { sql } from 'drizzle-orm';

const router = Router();

// Helper function to check admin access
const requireAdmin = (req: Request, res: Response, next: any) => {
  const auth = (req as any).auth;
  if (!auth || (auth.role !== 'admin' && auth.role !== 'super_admin')) {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * @openapi
 * /admin/dashboard:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get Admin Dashboard Overview
 *     description: Returns comprehensive admin dashboard with statistics, recent activities, alerts, and quick actions.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Admin dashboard data retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 overview:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                         recent:
 *                           type: integer
 *                     courses:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         published:
 *                           type: integer
 *                         draft:
 *                           type: integer
 *                     enrollments:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         completed:
 *                           type: integer
 *                         inProgress:
 *                           type: integer
 *                     forums:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                     chat:
 *                       type: object
 *                       properties:
 *                         rooms:
 *                           type: integer
 *                         messages:
 *                           type: integer
 *                         activeRooms:
 *                           type: integer
 *                     announcements:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         active:
 *                           type: integer
 *                 recentActivities:
 *                   type: array
 *                   items:
 *                     type: object
 *                 alerts:
 *                   type: object
 *                 quickActions:
 *                   type: array
 *                   items:
 *                     type: object
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/dashboard', clerkAuth, requireAdmin, getAdminDashboard);

/**
 * @openapi
 * /admin/reports:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get Admin Reports and Analytics
 *     description: Returns detailed analytics reports including user growth, course popularity, and forum activity.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Admin reports retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userGrowth:
 *                   type: array
 *                   items:
 *                     type: object
 *                 coursePopularity:
 *                   type: array
 *                   items:
 *                     type: object
 *                 forumActivity:
 *                   type: array
 *                   items:
 *                     type: object
 *                 generatedAt:
 *                   type: string
 *                   format: date-time
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/reports', clerkAuth, requireAdmin, getAdminReports);

/**
 * @openapi
 * /admin/dashboard/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get Admin Dashboard Statistics
 *     description: Returns comprehensive system statistics and recent activity for admin dashboard.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Dashboard statistics retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalUsers:
 *                       type: integer
 *                     totalCourses:
 *                       type: integer
 *                     totalLessons:
 *                       type: integer
 *                     totalEnrollments:
 *                       type: integer
 *                     totalForums:
 *                       type: integer
 *                     totalChatrooms:
 *                       type: integer
 *                     totalMessages:
 *                       type: integer
 *                     totalAnnouncements:
 *                       type: integer
 *                 recentActivity:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                     announcements:
 *                       type: array
 *                       items:
 *                         type: object
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/dashboard/stats', clerkAuth, requireAdmin, async (req, res) => {
  try {
    // Get comprehensive stats for admin dashboard
    const [
      totalUsers,
      totalCourses,
      totalLessons,
      totalEnrollments,
      totalForums,
      totalChatrooms,
      totalMessages,
      totalAnnouncements
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(users),
      db.select({ count: sql<number>`count(*)` }).from(courses),
      db.select({ count: sql<number>`count(*)` }).from(lessons),
      db.select({ count: sql<number>`count(*)` }).from(course_enrollments),
      db.select({ count: sql<number>`count(*)` }).from(forums),
      db.select({ count: sql<number>`count(*)` }).from(chatrooms),
      db.select({ count: sql<number>`count(*)` }).from(chat_messages),
      db.select({ count: sql<number>`count(*)` }).from(announcements)
    ]);

    // Get recent activity
    const recentUsers = await db
      .select()
      .from(users)
      .orderBy(sql`${users.created_at} desc`)
      .limit(5);

    const recentAnnouncements = await db
      .select()
      .from(announcements)
      .where(sql`${announcements.is_active} = true`)
      .orderBy(sql`${announcements.created_at} desc`)
      .limit(5);

    res.json({
      stats: {
        totalUsers: totalUsers[0].count,
        totalCourses: totalCourses[0].count,
        totalLessons: totalLessons[0].count,
        totalEnrollments: totalEnrollments[0].count,
        totalForums: totalForums[0].count,
        totalChatrooms: totalChatrooms[0].count,
        totalMessages: totalMessages[0].count,
        totalAnnouncements: totalAnnouncements[0].count
      },
      recentActivity: {
        users: recentUsers,
        announcements: recentAnnouncements
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get All Users (Admin)
 *     description: Returns a paginated list of all users in the system (Admin only).
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of users per page
 *     responses:
 *       '200':
 *         description: Users list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/users', clerkAuth, requireAdmin, getUsers);

/**
 * @openapi
 * /admin/users/{userId}/suspend:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Suspend User
 *     description: Suspends a user account (Admin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to suspend
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for suspension
 *     responses:
 *       '200':
 *         description: User suspended successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '403':
 *         description: Forbidden - Admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put('/users/:userId/suspend', clerkAuth, requireAdmin, suspendUser);

/**
 * @openapi
 * /admin/users/{userId}/activate:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Activate User
 *     description: Activates a suspended user account (Admin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to activate
 *     responses:
 *       '200':
 *         description: User activated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '403':
 *         description: Forbidden - Admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put('/users/:userId/activate', clerkAuth, requireAdmin, activateUser);

/**
 * @openapi
 * /admin/users/{userId}/role:
 *   put:
 *     tags:
 *       - Admin
 *     summary: Change User Role
 *     description: Changes a user's role (Super Admin only).
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *                 enum: [student, farmer, admin, super_admin]
 *                 description: New role for the user
 *     responses:
 *       '200':
 *         description: User role updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad request - Invalid role or cannot change own role.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Super admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.put('/users/:userId/role', clerkAuth, requireAdmin, changeUserRole);

/**
 * @openapi
 * /admin/users/{userId}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Delete User Permanently
 *     description: Permanently deletes a user account (Super Admin only - use with caution).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the user to delete
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: Reason for deletion
 *     responses:
 *       '200':
 *         description: User permanently deleted.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 deletedUser:
 *                   $ref: '#/components/schemas/User'
 *       '400':
 *         description: Bad request - Cannot delete own account.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Super admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: User not found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.delete('/users/:userId', clerkAuth, requireAdmin, deleteUserAdmin);

/**
 * @openapi
 * /admin/courses:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get All Courses (Admin)
 *     description: Returns a paginated list of all courses in the system (Admin only).
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of courses per page
 *     responses:
 *       '200':
 *         description: Courses list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Course'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/courses', clerkAuth, requireAdmin, getAllCoursesAdmin);

/**
 * @openapi
 * /admin/lessons:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get All Lessons (Admin)
 *     description: Returns a paginated list of all lessons in the system (Admin only).
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of lessons per page
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter lessons by course ID
 *     responses:
 *       '200':
 *         description: Lessons list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lessons:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Lesson'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/lessons', clerkAuth, requireAdmin, getAllLessonsAdmin);

/**
 * @openapi
 * /admin/enrollments:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get All Enrollments (Admin)
 *     description: Returns a paginated list of all course enrollments in the system (Admin only).
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of enrollments per page
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter enrollments by user ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter enrollments by course ID
 *     responses:
 *       '200':
 *         description: Enrollments list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enrollments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CourseEnrollment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/enrollments', clerkAuth, requireAdmin, getAllEnrollmentsAdmin);

/**
 * @openapi
 * /admin/forums:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get All Forums (Admin)
 *     description: Returns a paginated list of all forums in the system (Admin only).
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of forums per page
 *     responses:
 *       '200':
 *         description: Forums list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 forums:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Forum'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/forums', clerkAuth, requireAdmin, getAllForumsAdmin);

/**
 * @openapi
 * /admin/chatrooms:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get All Chatrooms (Admin)
 *     description: Returns a paginated list of all chatrooms in the system (Admin only).
 *     security:
 *       - bearerAuth: []
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
 *         description: Chatrooms list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 chatrooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Chatroom'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/chatrooms', clerkAuth, requireAdmin, getAllChatroomsAdmin);

/**
 * @openapi
 * /admin/chat/messages:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get All Chat Messages (Admin)
 *     description: Returns a paginated list of all chat messages in the system (Admin only).
 *     security:
 *       - bearerAuth: []
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
 *         description: Chat messages list retrieved successfully.
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
 *                   $ref: '#/components/schemas/Pagination'
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/chat/messages', clerkAuth, requireAdmin, getAllChatMessagesAdmin);

/**
 * @openapi
 * /admin/announcements:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get All Announcements (Admin)
 *     description: Returns a paginated list of all announcements including inactive ones (Admin only).
 *     security:
 *       - bearerAuth: []
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
 *         description: Number of announcements per page
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to return only active announcements
 *     responses:
 *       '200':
 *         description: Announcements list retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 announcements:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Announcement'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.get('/announcements', clerkAuth, requireAdmin, getAllAnnouncements);

/**
 * @openapi
 * /admin/announcements/bulk-activate:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Bulk Activate Announcements
 *     description: Activates multiple announcements at once (Admin only).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - announcementIds
 *             properties:
 *               announcementIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of announcement IDs to activate
 *     responses:
 *       '200':
 *         description: Announcements activated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Announcements activated successfully"
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.post('/announcements/bulk-activate', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const { announcementIds } = req.body;
    if (!Array.isArray(announcementIds)) {
      return res.status(400).json({ error: 'announcementIds must be an array' });
    }

    await db
      .update(announcements)
      .set({ is_active: true, updated_at: new Date() })
      .where(sql`${announcements.announcement_id} in ${announcementIds}`);

    res.json({ message: 'Announcements activated successfully' });
  } catch (error) {
    console.error('Error bulk activating announcements:', error);
    res.status(500).json({ error: 'Failed to activate announcements' });
  }
});

/**
 * @openapi
 * /admin/announcements/bulk-deactivate:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Bulk Deactivate Announcements
 *     description: Deactivates multiple announcements at once (Admin only).
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - announcementIds
 *             properties:
 *               announcementIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of announcement IDs to deactivate
 *     responses:
 *       '200':
 *         description: Announcements deactivated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Announcements deactivated successfully"
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden - Admin access required.
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
router.post('/announcements/bulk-deactivate', clerkAuth, requireAdmin, async (req, res) => {
  try {
    const { announcementIds } = req.body;
    if (!Array.isArray(announcementIds)) {
      return res.status(400).json({ error: 'announcementIds must be an array' });
    }

    await db
      .update(announcements)
      .set({ is_active: false, updated_at: new Date() })
      .where(sql`${announcements.announcement_id} in ${announcementIds}`);

    res.json({ message: 'Announcements deactivated successfully' });
  } catch (error) {
    console.error('Error bulk deactivating announcements:', error);
    res.status(500).json({ error: 'Failed to deactivate announcements' });
  }
});

/**
 * @openapi
 * /admin/system/health:
 *   get:
 *     tags:
 *       - Admin
 *     summary: System Health Check
 *     description: Performs a health check on system services (Admin only).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: System health check completed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 services:
 *                   type: object
 *                   properties:
 *                     database:
 *                       type: string
 *                       example: "healthy"
 *       '403':
 *         description: Forbidden - Admin access required.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '503':
 *         description: Service unavailable - System health check failed.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "unhealthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 error:
 *                   type: string
 *                   example: "System health check failed"
 */
router.get('/system/health', clerkAuth, requireAdmin, async (req, res) => {
  try {
    // Basic system health metrics
    await db.execute(sql`SELECT 1 as health_check`);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'healthy'
      }
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'System health check failed'
    });
  }
});

export default router;
