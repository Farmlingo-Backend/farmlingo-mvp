"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const clerk_1 = require("../middlewares/clerk");
const enrollments_controller_1 = require("../controllers/enrollments.controller");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
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
exports.default = router;
// Runtime endpoints
router.get('/', enrollments_controller_1.getEnrollments);
router.post('/', clerk_1.clerkAuth, upload.none(), enrollments_controller_1.createEnrollment);
router.get('/:enrollmentId', enrollments_controller_1.getEnrollmentById);
router.put('/:enrollmentId', clerk_1.clerkAuth, upload.none(), enrollments_controller_1.updateEnrollment);
router.delete('/:enrollmentId', clerk_1.clerkAuth, enrollments_controller_1.deleteEnrollment);
// Admin endpoints
router.get('/admin/all', clerk_1.clerkAuth, enrollments_controller_1.getAllEnrollmentsAdmin);
