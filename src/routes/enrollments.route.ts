import { Router } from 'express';
import multer from 'multer';
import { clerkAuth } from '../middlewares/clerk';
import {
  getEnrollments,
  createEnrollment,
  getEnrollmentById,
  updateEnrollment,
  deleteEnrollment
} from '../controllers/enrollments.controller';

const router = Router();
const upload = multer();

/**
 * @openapi
 * /enrollments:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get all enrollments
 *     description: Retrieve a list of all enrollments.
 *     responses:
 *       '200':
 *         description: A list of enrollments.
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Create an enrollment
 *     description: Create a new enrollment.
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               courseId:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Enrollment created successfully.
 *
 * /enrollments/{enrollmentId}:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get enrollment by ID
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Enrollment details.
 *   put:
 *     tags:
 *       - Enrollments
 *     summary: Update enrollment
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Enrollment updated.
 *   delete:
 *     tags:
 *       - Enrollments
 *     summary: Delete enrollment
 *     security:
 *       - clerkAuth: []
 *     parameters:
 *       - in: path
 *         name: enrollmentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Enrollment deleted.
 */

export default router;
// Runtime endpoints
router.get('/', getEnrollments);
router.post('/', clerkAuth, upload.none(), createEnrollment);
router.get('/:enrollmentId', getEnrollmentById);
router.put('/:enrollmentId', clerkAuth, upload.none(), updateEnrollment);
router.delete('/:enrollmentId', clerkAuth, deleteEnrollment);
