"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("../controllers/users.controller");
const auth_1 = require("../middlewares/auth");
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)();
/**
 * @openapi
 * /users/register:
 *   post:
 *     tags:
 *       - Users
 *     summary: Register a new user
 *     description: Creates a new user record in the database.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/NewUser'
 *     responses:
 *       '201':
 *         description: User created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Missing or invalid fields.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '409':
 *         description: Duplicate email or clerk_user_id.
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
router.post('/register', upload.none(), users_controller_1.registerUser);
/**
 * @openapi
 * /users/login:
 *   post:
 *     tags:
 *       - Users
 *     summary: Login a user
 *     description: Authenticates a user and returns a JWT access token.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UserLoginRequest'
 *     responses:
 *       '200':
 *         description: Login successful.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokenResponse'
 *       '400':
 *         description: Missing credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '401':
 *         description: Invalid credentials.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: User is inactive.
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
router.post('/login', upload.none(), users_controller_1.loginUser);
/**
 * @openapi
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: List users
 *     description: Returns a list of users (admin-only).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       '401':
 *         description: Unauthorized.
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
router.get('/', auth_1.authenticate, users_controller_1.getUsers);
/**
 * @openapi
 * /users/{userId}/profile:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user profile
 *     description: Returns the profile for the specified user. Only the user themselves or an admin can access this.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user whose profile is being requested.
 *     responses:
 *       '200':
 *         description: User profile.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       '400':
 *         description: Missing user_id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '401':
 *         description: Unauthorized (missing or invalid token).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden (user cannot access this profile).
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
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:userId/profile', auth_1.authenticate, users_controller_1.getUserProfile);
/**
 * @openapi
 * /users/{userId}/dashboard:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user dashboard
 *     description: Returns dashboard information for the specified user. Only the user themselves or an admin can access this.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the user whose dashboard is being requested.
 *     responses:
 *       '200':
 *         description: User dashboard data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDashboardResponse'
 *       '400':
 *         description: Missing user_id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '401':
 *         description: Unauthorized (missing or invalid token).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       '403':
 *         description: Forbidden (user cannot access this dashboard).
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
 *       '500':
 *         description: Unexpected server error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
router.get('/:userId/dashboard', auth_1.authenticate, users_controller_1.getUserDashboard);
exports.default = router;
