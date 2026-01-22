/**
 * @openapi
 * /chatrooms:
 *   post:
 *     tags:
 *       - Chatrooms
 *     summary: Create a chatroom
 *     security:
 *       - clerkAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - chatroom_type
 *               - name
 *             properties:
 *               chatroom_type:
 *                 type: string
 *                 enum: [direct, group, topic_based]
 *                 description: Type of the chatroom
 *               name:
 *                 type: string
 *                 description: Name of the chatroom (required for group and topic_based)
 *               description:
 *                 type: string
 *                 description: Description of the chatroom
 *     responses:
 *       '201':
 *         description: Chatroom created successfully.
 *       '400':
 *         description: Bad request - Invalid input data.
 */
