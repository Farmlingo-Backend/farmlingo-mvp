"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const health_route_1 = __importDefault(require("./health.route"));
const users_route_1 = __importDefault(require("./users.route"));
const courses_route_1 = __importDefault(require("./courses.route"));
const lessons_route_1 = __importDefault(require("./lessons.route"));
const forums_route_1 = __importDefault(require("./forums.route"));
const enrollments_route_1 = __importDefault(require("./enrollments.route"));
const chat_route_1 = __importDefault(require("./chat.route"));
const chats_route_1 = __importDefault(require("./chats.route")); // Direct chat
const membership_route_1 = __importDefault(require("./membership.route"));
const announcements_route_1 = __importDefault(require("./announcements.route"));
const admin_route_1 = __importDefault(require("./admin.route"));
const webhooks_route_1 = __importDefault(require("./webhooks.route")); // Clerk webhooks
const weather_route_1 = __importDefault(require("./weather.route")); // Weather data API
const router = (0, express_1.Router)();
router.use('/health', health_route_1.default);
router.use('/users', users_route_1.default);
router.use('/courses', courses_route_1.default);
router.use('/lessons', lessons_route_1.default);
router.use('/forums', forums_route_1.default);
router.use('/enrollments', enrollments_route_1.default);
router.use('/chatrooms', chat_route_1.default);
router.use('/chats', chats_route_1.default);
router.use('/memberships', membership_route_1.default);
router.use('/announcements', announcements_route_1.default);
router.use('/admin', admin_route_1.default);
router.use('/webhooks', webhooks_route_1.default);
router.use('/weather', weather_route_1.default);
exports.default = router;
