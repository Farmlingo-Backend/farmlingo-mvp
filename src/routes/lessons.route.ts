import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth';
import {
  getLessons,
  createLesson,
  getLessonById,
  updateLesson,
  deleteLesson
} from '../controllers/lessons.controller';

const router = Router();
const upload = multer();

/**
 * @openapi
 * /lessons:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: List all lessons
 *     description: Returns a paginated list of all lessons.
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
 *         description: Number of lessons per page
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter lessons by course ID
 *     responses:
 *       '200':
 *         description: A list of lessons.
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
 *       - Lessons
 *     summary: Create a new lesson
 *     description: Creates a new lesson with the provided details.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewLesson'
 *     responses:
 *       '201':
 *         description: Lesson created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
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
 * /lessons/{lessonId}:
 *   get:
 *     tags:
 *       - Lessons
 *     summary: Get a specific lesson
 *     description: Returns details of a specific lesson by ID.
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the lesson to retrieve
 *     responses:
 *       '200':
 *         description: Lesson details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       '404':
 *         description: Lesson not found.
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
 *       - Lessons
 *     summary: Update a lesson
 *     description: Updates an existing lesson with new details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the lesson to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewLesson'
 *     responses:
 *       '200':
 *         description: Lesson updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lesson'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Lesson not found.
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
 *       - Lessons
 *     summary: Delete a lesson
 *     description: Deletes a lesson by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the lesson to delete
 *     responses:
 *       '204':
 *         description: Lesson deleted successfully.
 *       '404':
 *         description: Lesson not found.
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

export default router;
// Runtime endpoints
router.get('/', getLessons);
router.post('/', authenticate, upload.none(), createLesson);
router.get('/:lessonId', getLessonById);
router.put('/:lessonId', authenticate, upload.none(), updateLesson);
router.delete('/:lessonId', authenticate, deleteLesson);
