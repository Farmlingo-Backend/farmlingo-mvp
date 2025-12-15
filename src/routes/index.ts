import { Router } from 'express';
import healthRouter from './health.route';
import usersRouter from './users.route';
import coursesRouter from './courses.route';
import lessonsRouter from './lessons.route';
import forumsRouter from './forums.route';
import enrollmentsRouter from './enrollments.route';
import chatRouter from './chat.route';
import chatsRouter from './chats.route'; // Direct chat
import webhooksRouter from './webhooks.route'; // Clerk webhooks

const router = Router();

router.use('/health', healthRouter);
router.use('/users', usersRouter);
router.use('/courses', coursesRouter);
router.use('/lessons', lessonsRouter);
router.use('/forums', forumsRouter);
router.use('/enrollments', enrollmentsRouter);
router.use('/chatrooms', chatRouter);
router.use('/chats', chatsRouter); // Mount for direct chat endpoints
router.use('/webhooks', webhooksRouter); // Mount webhook endpoints

export default router;
