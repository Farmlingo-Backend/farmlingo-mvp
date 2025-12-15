"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const auth_1 = require("../middlewares/auth");
const enrollments_controller_1 = require("../controllers/enrollments.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
/**
 * @openapi
 * /enrollments:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: List all course enrollments
 *     description: Returns a paginated list of all course enrollments.
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
 *         description: A list of enrollments.
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
 *       - Enrollments
 *     summary: Enroll in a course
 *     description: Creates a new course enrollment.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewEnrollment'
 *     responses:
 *       '201':
 *         description: Enrollment created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseEnrollment'
 *       '400':
 *         description: Bad request - Invalid input data or already enrolled.
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
 * /enrollments/{enrollmentId}:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get a specific enrollment
 *     description: Returns details of a specific course enrollment by ID.
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the enrollment to retrieve
 *     responses:
 *       '200':
 *         description: Enrollment details.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseEnrollment'
 *       '404':
 *         description: Enrollment not found.
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
 *       - Enrollments
 *     summary: Update enrollment progress
 *     description: Updates an existing enrollment with new progress or status.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the enrollment to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               progress_percentage:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *                 description: Progress percentage (0-100)
 *               status:
 *                 type: string
 *                 enum: [active, completed, dropped, paused]
 *                 description: Enrollment status
 *     responses:
 *       '200':
 *         description: Enrollment updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseEnrollment'
 *       '400':
 *         description: Bad request - Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '404':
 *         description: Enrollment not found.
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
 *       - Enrollments
 *     summary: Delete an enrollment
 *     description: Deletes a course enrollment by ID.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: The ID of the enrollment to delete
 *     responses:
 *       '204':
 *         description: Enrollment deleted successfully.
 *       '404':
 *         description: Enrollment not found.
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
router.get('/', enrollments_controller_1.getEnrollments);
router.post('/', auth_1.authenticate, upload.none(), enrollments_controller_1.createEnrollment);
router.get('/:enrollmentId', enrollments_controller_1.getEnrollmentById);
router.put('/:enrollmentId', auth_1.authenticate, upload.none(), enrollments_controller_1.updateEnrollment);
router.delete('/:enrollmentId', auth_1.authenticate, enrollments_controller_1.deleteEnrollment);
