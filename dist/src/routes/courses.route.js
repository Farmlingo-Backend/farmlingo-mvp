"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middlewares/auth");
const courses_controller_1 = require("../controllers/courses.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
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
exports.default = router;
// Runtime endpoints
router.get('/', courses_controller_1.getCourses);
router.post('/', auth_1.authenticate, upload.none(), courses_controller_1.createCourse);
router.get('/:courseId', courses_controller_1.getCourseById);
router.put('/:courseId', auth_1.authenticate, upload.none(), courses_controller_1.updateCourse);
router.delete('/:courseId', auth_1.authenticate, courses_controller_1.deleteCourse);
