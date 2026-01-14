import { Router } from 'express';
import multer from 'multer';
import { clerkAuth } from '../middlewares/clerk';
import {
  getForums,
  createForum,
  getForumById,
  updateForum,
  deleteForum,
  getForumPosts,
  createForumPost,
  getAllForumsAdmin
} from '../controllers/forums.controller';

const router = Router();
const upload = multer();

/**
 * @openapi
 * /forums:
 *   get:
 *     tags:
 *       - Forums
 *     summary: Get all forums
 *     responses:
 *       '200':
 *         description: List of forums.
 *   post:
 *     tags:
 *       - Forums
 *     summary: Create a forum
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Forum created.
 *
 * /forums/{forumId}:
 *   get:
 *     tags:
 *       - Forums
 *     summary: Get forum by ID
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Forum details.
 *   put:
 *     tags:
 *       - Forums
 *     summary: Update forum
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Forum updated.
 *   delete:
 *     tags:
 *       - Forums
 *     summary: Delete forum
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Forum deleted.
 *
 * /forums/{forumId}/posts:
 *   get:
 *     tags:
 *       - Forums
 *     summary: Get forum posts
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: List of posts.
 *   post:
 *     tags:
 *       - Forums
 *     summary: Create forum post
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: Post created.
 */

export default router;
// Runtime endpoints
router.get('/', getForums);
router.post('/', clerkAuth, upload.none(), createForum);
router.get('/:forumId', getForumById);
router.put('/:forumId', clerkAuth, upload.none(), updateForum);
router.delete('/:forumId', clerkAuth, deleteForum);
router.get('/:forumId/posts', getForumPosts);
router.post('/:forumId/posts', clerkAuth, upload.none(), createForumPost);

// Admin endpoints
router.get('/admin/all', clerkAuth, getAllForumsAdmin);
