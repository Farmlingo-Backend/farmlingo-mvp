"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const clerk_1 = require("../middlewares/clerk");
const forums_controller_1 = require("../controllers/forums.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
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
exports.default = router;
// Runtime endpoints
router.get('/', forums_controller_1.getForums);
router.post('/', clerk_1.clerkAuth, upload.none(), forums_controller_1.createForum);
router.get('/:forumId', forums_controller_1.getForumById);
router.put('/:forumId', clerk_1.clerkAuth, upload.none(), forums_controller_1.updateForum);
router.delete('/:forumId', clerk_1.clerkAuth, forums_controller_1.deleteForum);
router.get('/:forumId/posts', forums_controller_1.getForumPosts);
router.post('/:forumId/posts', clerk_1.clerkAuth, upload.none(), forums_controller_1.createForumPost);
// Admin endpoints
router.get('/admin/all', clerk_1.clerkAuth, forums_controller_1.getAllForumsAdmin);
