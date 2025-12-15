import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth';
import {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse
} from '../controllers/courses.controller';

const router = Router();
const upload = multer();

/**
 * @openapi
 * /courses:
 *   get:
 *     tags:
 *       - Courses
 *     summary: List all courses
 *     description: Returns a paginated list of all available courses.
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
 *         description: Number of courses per page
 *     responses:
 *       '200':
 *         description: A list of courses.
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
 *       - Courses
 *     summary: Create a new course
 *     description: Creates a new course with the provided details.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewCourse'
 *     responses:
 *       '201':
 *         description: Course created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
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
 * /courses/{courseId}:
 *   get:
 *     tags:
 *       - Courses
 *     summary: Get a specific course
 *     description: Returns details of a specific course by ID.
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the course to retrieve
 *     responses:
 *       '200':
 *         description: Course details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       '404':
 *         description: Course not found.
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
 *       - Courses
 *     summary: Update a course
 *     description: Updates an existing course with new details.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the course to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewCourse'
 *     responses:
 *       '200':
 *         description: Course updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Course not found.
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
 *       - Courses
 *     summary: Delete a course
 *     description: Deletes a course by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the course to delete
 *     responses:
 *       '204':
 *         description: Course deleted successfully.
 *       '404':
 *         description: Course not found.
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
router.get('/', getCourses);
router.post('/', authenticate, upload.none(), createCourse);
router.get('/:courseId', getCourseById);
router.put('/:courseId', authenticate, upload.none(), updateCourse);
router.delete('/:courseId', authenticate, deleteCourse);
