"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middlewares/auth");
const forums_controller_1 = require("../controllers/forums.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
/**
 * @openapi
 * /forums:
 *   get:
 *     tags:
 *       - Forums
 *     summary: List all forums
 *     description: Returns a paginated list of all forums.
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
 *         description: Number of forums per page
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter forums by course ID
 *     responses:
 *       '200':
 *         description: A list of forums.
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
 *       - Forums
 *     summary: Create a new forum
 *     description: Creates a new forum with the provided details.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewForum'
 *     responses:
 *       '201':
 *         description: Forum created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Forum'
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
 * /forums/{forumId}:
 *   get:
 *     tags:
 *       - Forums
 *     summary: Get a specific forum
 *     description: Returns details of a specific forum by ID.
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the forum to retrieve
 *     responses:
 *       '200':
 *         description: Forum details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Forum'
 *       '404':
 *         description: Forum not found.
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
 *       - Forums
 *     summary: Update a forum
 *     description: Updates an existing forum with new details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the forum to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewForum'
 *     responses:
 *       '200':
 *         description: Forum updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Forum'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Forum not found.
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
 *       - Forums
 *     summary: Delete a forum
 *     description: Deletes a forum by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the forum to delete
 *     responses:
 *       '204':
 *         description: Forum deleted successfully.
 *       '404':
 *         description: Forum not found.
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
 * /forums/{forumId}/posts:
 *   get:
 *     tags:
 *       - Forums
 *     summary: Get forum posts
 *     description: Returns a paginated list of posts in a specific forum.
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the forum
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
 *         description: Number of posts per page
 *     responses:
 *       '200':
 *         description: A list of forum posts.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       '404':
 *         description: Forum not found.
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
 *       - Forums
 *     summary: Create a forum post
 *     description: Creates a new post in a forum.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: forumId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the forum
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewForumPost'
 *     responses:
 *       '201':
 *         description: Post created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ForumPost'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Forum not found.
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
router.get('/', forums_controller_1.getForums);
router.post('/', auth_1.authenticate, upload.none(), forums_controller_1.createForum);
router.get('/:forumId', forums_controller_1.getForumById);
router.put('/:forumId', auth_1.authenticate, upload.none(), forums_controller_1.updateForum);
router.delete('/:forumId', auth_1.authenticate, forums_controller_1.deleteForum);
router.get('/:forumId/posts', forums_controller_1.getForumPosts);
router.post('/:forumId/posts', auth_1.authenticate, upload.none(), forums_controller_1.createForumPost);
