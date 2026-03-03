"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chat_messages = exports.chatroom_members = exports.chatrooms = exports.post_read_status = exports.post_reactions = exports.comments = exports.forum_posts = exports.forums = exports.quiz_answers = exports.quiz_attempts = exports.question_options = exports.quiz_questions = exports.quizzes = exports.lesson_media = exports.course_certificates = exports.lesson_progress = exports.course_enrollments = exports.lessons = exports.course_ratings = exports.courses = exports.locations = exports.institutions = exports.users = exports.logLevelEnum = exports.moduleEnum = exports.notificationTypeEnum = exports.membershipActionEnum = exports.invitationStatusEnum = exports.membershipRequestStatusEnum = exports.actionTypeEnum = exports.actionTakenEnum = exports.reportStatusEnum = exports.reportTypeEnum = exports.attachmentFileTypeEnum = exports.messageTypeEnum = exports.chatMemberStatusEnum = exports.chatMemberRoleEnum = exports.chatroomStatusEnum = exports.chatroomTypeEnum = exports.reactionTypeEnum = exports.commentStatusEnum = exports.forumStatusEnum = exports.quizAttemptStatusEnum = exports.quizQuestionTypeEnum = exports.mediaTypeEnum = exports.lessonProgressStatusEnum = exports.enrollmentStatusEnum = exports.lessonStatusEnum = exports.courseStatusEnum = exports.rolesEnum = void 0;
exports.courseEnrollmentsTable = exports.lessonsTable = exports.courseRatingsTable = exports.coursesTable = exports.locationsTable = exports.usersTable = exports.weatherDataRelations = exports.announcementsRelations = exports.systemLogsRelations = exports.userReportsRelations = exports.notificationsRelations = exports.chatroomInvitationsRelations = exports.membershipLogsRelations = exports.membershipRequestsRelations = exports.messageReactionsRelations = exports.messageReadStatusRelations = exports.messageAttachmentsRelations = exports.chatMessagesRelations = exports.chatroomMembersRelations = exports.chatroomsRelations = exports.postReadStatusRelations = exports.postReactionsRelations = exports.commentsRelations = exports.forumPostsRelations = exports.forumsRelations = exports.quizAnswersRelations = exports.quizAttemptsRelations = exports.questionOptionsRelations = exports.quizQuestionsRelations = exports.quizzesRelations = exports.lessonMediaRelations = exports.courseCertificatesRelations = exports.lessonProgressRelations = exports.courseEnrollmentsRelations = exports.lessonsRelations = exports.coursesRelations = exports.locationsRelations = exports.institutionsRelations = exports.usersRelations = exports.notifications = exports.chatroom_invitations = exports.membership_logs = exports.membership_requests = exports.weather_data = exports.announcements = exports.system_logs = exports.user_reports = exports.message_reactions = exports.message_read_status = exports.message_attachments = void 0;
exports.log_level_enum = exports.module_enum = exports.action_type_enum = exports.action_taken_enum = exports.report_status_enum = exports.report_type_enum = exports.attachment_file_type_enum = exports.message_type_enum = exports.chat_member_status_enum = exports.chat_member_role_enum = exports.chatroom_status_enum = exports.chatroom_type_enum = exports.reaction_type_enum = exports.comment_status_enum = exports.forum_status_enum = exports.quiz_attempt_status_enum = exports.quiz_question_type_enum = exports.media_type_enum = exports.lesson_progress_status_enum = exports.enrollment_status_enum = exports.lesson_status_enum = exports.course_status_enum = exports.roles_enum = exports.weatherDataTable = exports.announcementsTable = exports.systemLogsTable = exports.userReportsTable = exports.notificationsTable = exports.chatroomInvitationsTable = exports.membershipLogsTable = exports.membershipRequestsTable = exports.messageReactionsTable = exports.messageReadStatusTable = exports.messageAttachmentsTable = exports.chatMessagesTable = exports.chatroomMembersTable = exports.chatroomsTable = exports.postReadStatusTable = exports.postReactionsTable = exports.commentsTable = exports.forumPostsTable = exports.forumsTable = exports.quizAnswersTable = exports.quizAttemptsTable = exports.questionOptionsTable = exports.quizQuestionsTable = exports.quizzesTable = exports.lessonMediaTable = exports.courseCertificatesTable = exports.lessonProgressTable = void 0;
exports.notification_type_enum = exports.membership_action_enum = exports.invitation_status_enum = exports.membership_request_status_enum = void 0;
// src/db/schema.ts
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
/**
 * Enums
 */
exports.rolesEnum = (0, pg_core_1.pgEnum)("roles", [
    "student",
    "farmer",
    "instructor",
    "institution_admin",
    "super_admin",
]);
exports.roles_enum = exports.rolesEnum;
exports.courseStatusEnum = (0, pg_core_1.pgEnum)("course_status", [
    "draft",
    "unpublished",
    "published",
]);
exports.course_status_enum = exports.courseStatusEnum;
exports.lessonStatusEnum = (0, pg_core_1.pgEnum)("lesson_status", ["draft", "published"]);
exports.lesson_status_enum = exports.lessonStatusEnum;
exports.enrollmentStatusEnum = (0, pg_core_1.pgEnum)("enrollment_status", [
    "not_started",
    "in_progress",
    "completed",
    "dropped",
]);
exports.enrollment_status_enum = exports.enrollmentStatusEnum;
exports.lessonProgressStatusEnum = (0, pg_core_1.pgEnum)("lesson_progress_status", [
    "not_started",
    "in_progress",
    "completed",
]);
exports.lesson_progress_status_enum = exports.lessonProgressStatusEnum;
exports.mediaTypeEnum = (0, pg_core_1.pgEnum)("media_type", [
    "video",
    "pdf",
    "image",
    "audio",
    "document",
]);
exports.media_type_enum = exports.mediaTypeEnum;
exports.quizQuestionTypeEnum = (0, pg_core_1.pgEnum)("question_type", [
    "multiple_choice",
    "true_false",
    "multiple_answer",
]);
exports.quiz_question_type_enum = exports.quizQuestionTypeEnum;
exports.quizAttemptStatusEnum = (0, pg_core_1.pgEnum)("quiz_attempt_status", [
    "in_progress",
    "completed",
    "abandoned",
]);
exports.quiz_attempt_status_enum = exports.quizAttemptStatusEnum;
exports.forumStatusEnum = (0, pg_core_1.pgEnum)("forum_status", [
    "active",
    "deleted",
    "flagged",
    "archived",
]);
exports.forum_status_enum = exports.forumStatusEnum;
exports.commentStatusEnum = (0, pg_core_1.pgEnum)("comment_status", [
    "active",
    "deleted",
    "flagged",
]);
exports.comment_status_enum = exports.commentStatusEnum;
exports.reactionTypeEnum = (0, pg_core_1.pgEnum)("reaction_type", ["like", "dislike"]);
exports.reaction_type_enum = exports.reactionTypeEnum;
exports.chatroomTypeEnum = (0, pg_core_1.pgEnum)("chatroom_type", [
    "direct",
    "group",
    "topic_based",
]);
exports.chatroom_type_enum = exports.chatroomTypeEnum;
exports.chatroomStatusEnum = (0, pg_core_1.pgEnum)("chatroom_status", [
    "active",
    "archived",
]);
exports.chatroom_status_enum = exports.chatroomStatusEnum;
exports.chatMemberRoleEnum = (0, pg_core_1.pgEnum)("chat_member_role", [
    "admin",
    "moderator",
    "member",
]);
exports.chat_member_role_enum = exports.chatMemberRoleEnum;
exports.chatMemberStatusEnum = (0, pg_core_1.pgEnum)("chat_member_status", [
    "active",
    "left",
    "removed",
    "banned",
]);
exports.chat_member_status_enum = exports.chatMemberStatusEnum;
exports.messageTypeEnum = (0, pg_core_1.pgEnum)("message_type", [
    "text",
    "image",
    "video",
    "audio",
    "file",
    "system",
]);
exports.message_type_enum = exports.messageTypeEnum;
exports.attachmentFileTypeEnum = (0, pg_core_1.pgEnum)("attachment_file_type", [
    "image",
    "video",
    "audio",
    "document",
    "pdf",
]);
exports.attachment_file_type_enum = exports.attachmentFileTypeEnum;
exports.reportTypeEnum = (0, pg_core_1.pgEnum)("report_type", [
    "spam",
    "harassment",
    "inappropriate",
    "misinformation",
]);
exports.report_type_enum = exports.reportTypeEnum;
exports.reportStatusEnum = (0, pg_core_1.pgEnum)("report_status", [
    "pending",
    "in_review",
    "resolved",
    "dismissed",
]);
exports.report_status_enum = exports.reportStatusEnum;
exports.actionTakenEnum = (0, pg_core_1.pgEnum)("action_taken", [
    "none",
    "warning",
    "content_removed",
    "user_suspended",
    "user_banned",
]);
exports.action_taken_enum = exports.actionTakenEnum;
exports.actionTypeEnum = (0, pg_core_1.pgEnum)("action_type", [
    "login",
    "logout",
    "content_upload",
    "user_delete",
    "api_call",
    "admin_action",
]);
exports.action_type_enum = exports.actionTypeEnum;
exports.membershipRequestStatusEnum = (0, pg_core_1.pgEnum)("membership_request_status", [
    "pending",
    "approved",
    "rejected",
    "cancelled",
]);
exports.membership_request_status_enum = exports.membershipRequestStatusEnum;
exports.invitationStatusEnum = (0, pg_core_1.pgEnum)("invitation_status", [
    "pending",
    "accepted",
    "expired",
    "cancelled",
]);
exports.invitation_status_enum = exports.invitationStatusEnum;
exports.membershipActionEnum = (0, pg_core_1.pgEnum)("membership_action", [
    "join",
    "leave",
    "added",
    "removed",
    "role_changed",
    "banned",
    "unbanned",
]);
exports.membership_action_enum = exports.membershipActionEnum;
exports.notificationTypeEnum = (0, pg_core_1.pgEnum)("notification_type", [
    "message",
    "member_join",
    "member_leave",
    "member_added",
    "member_removed",
    "invitation",
    "request_approved",
    "request_rejected",
]);
exports.notification_type_enum = exports.notificationTypeEnum;
exports.moduleEnum = (0, pg_core_1.pgEnum)("module_type", [
    "auth",
    "forum",
    "chat",
    "course",
    "admin",
    "system",
]);
exports.module_enum = exports.moduleEnum;
exports.logLevelEnum = (0, pg_core_1.pgEnum)("log_level", [
    "info",
    "warning",
    "error",
    "critical",
]);
exports.log_level_enum = exports.logLevelEnum;
/**
 * TABLES
 */
/**
 * USERS
 */
exports.users = (0, pg_core_1.pgTable)("users", {
    user_id: (0, pg_core_1.uuid)("user_id").primaryKey().defaultRandom(),
    clerk_user_id: (0, pg_core_1.varchar)("clerk_user_id", { length: 128 }).unique(),
    role: (0, exports.rolesEnum)("role").default("student").notNull(), // ADDED for RBAC
    institution_id: (0, pg_core_1.uuid)("institution_id"), // Nullable for Super Admin
    email: (0, pg_core_1.varchar)("email", { length: 320 }).notNull().unique(),
    first_name: (0, pg_core_1.varchar)("first_name", { length: 128 }),
    last_name: (0, pg_core_1.varchar)("last_name", { length: 128 }),
    image_url: (0, pg_core_1.varchar)("image_url", { length: 1000 }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
    last_login: (0, pg_core_1.timestamp)("last_login", { withTimezone: true }),
    is_active: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
}, () => [
// unique constraints
// clerk_user_id optional unique
// NOTE: Drizzle uniqueIndex helper is used as table-level indexes
// we add unique indexes where ERD specified UK
// (the API for uniqueIndex is available via the same core import in some versions;
//  here we use a simple approach - define unique indexes via callback helpers)
// but to keep compatibility we won't call unknown helpers; instead rely on DB migrations to create unique constraints if desired.
]);
exports.usersTable = exports.users;
/**
 * INSTITUTIONS
 */
exports.institutions = (0, pg_core_1.pgTable)("institutions", {
    institution_id: (0, pg_core_1.uuid)("institution_id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.varchar)("name", { length: 256 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    logo_url: (0, pg_core_1.varchar)("logo_url", { length: 1000 }),
    email_domain: (0, pg_core_1.varchar)("email_domain", { length: 128 }), // Optional: restrict to institutional emails
    created_by: (0, pg_core_1.uuid)("created_by").notNull(), // Super Admin who created this institution
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
/**
 * LOCATIONS
 */
exports.locations = (0, pg_core_1.pgTable)("locations", {
    location_id: (0, pg_core_1.uuid)("location_id").primaryKey().defaultRandom(),
    location_name: (0, pg_core_1.varchar)("location_name", { length: 256 }),
    country: (0, pg_core_1.varchar)("country", { length: 128 }),
    country_code: (0, pg_core_1.varchar)("country_code", { length: 8 }),
    latitude: (0, pg_core_1.doublePrecision)("latitude"),
    longitude: (0, pg_core_1.doublePrecision)("longitude"),
    timezone: (0, pg_core_1.varchar)("timezone", { length: 64 }),
    location_details: (0, pg_core_1.jsonb)("location_details"),
    user_count: (0, pg_core_1.integer)("user_count").default(0),
});
exports.locationsTable = exports.locations;
/**
 * COURSES
 */
exports.courses = (0, pg_core_1.pgTable)("courses", {
    course_id: (0, pg_core_1.uuid)("course_id").primaryKey().defaultRandom(),
    institution_id: (0, pg_core_1.uuid)("institution_id"), // Institution that owns this course
    title: (0, pg_core_1.varchar)("title", { length: 512 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category", { length: 128 }),
    language: (0, pg_core_1.varchar)("language", { length: 16 }),
    thumbnail_url: (0, pg_core_1.varchar)("thumbnail_url", { length: 1000 }),
    total_lessons: (0, pg_core_1.integer)("total_lessons").default(0),
    total_duration_minutes: (0, pg_core_1.integer)("total_duration_minutes").default(0),
    average_rating: (0, pg_core_1.doublePrecision)("average_rating").default(0),
    rating_count: (0, pg_core_1.integer)("rating_count").default(0),
    status: (0, exports.courseStatusEnum)("status").default("draft"),
    creator_id: (0, pg_core_1.uuid)("creator_id"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.coursesTable = exports.courses;
/**
 * COURSE_RATINGS
 */
exports.course_ratings = (0, pg_core_1.pgTable)("course_ratings", {
    rating_id: (0, pg_core_1.uuid)("rating_id").primaryKey().defaultRandom(),
    course_id: (0, pg_core_1.uuid)("course_id").notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    rating_value: (0, pg_core_1.integer)("rating_value").notNull(),
    review_text: (0, pg_core_1.text)("review_text"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.courseRatingsTable = exports.course_ratings;
/**
 * LESSONS
 */
exports.lessons = (0, pg_core_1.pgTable)("lessons", {
    lesson_id: (0, pg_core_1.uuid)("lesson_id").primaryKey().defaultRandom(),
    course_id: (0, pg_core_1.uuid)("course_id").notNull(),
    institution_id: (0, pg_core_1.uuid)("institution_id"), // Institution that owns this lesson
    title: (0, pg_core_1.varchar)("title", { length: 512 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    category: (0, pg_core_1.varchar)("category", { length: 128 }),
    duration_minutes: (0, pg_core_1.integer)("duration_minutes").default(0),
    order_number: (0, pg_core_1.integer)("order_number").default(0),
    is_mandatory: (0, pg_core_1.boolean)("is_mandatory").default(false),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    status: (0, exports.lessonStatusEnum)("status").default("draft"),
    creator_id: (0, pg_core_1.uuid)("creator_id"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.lessonsTable = exports.lessons;
/**
 * COURSE_ENROLLMENTS
 */
exports.course_enrollments = (0, pg_core_1.pgTable)("course_enrollments", {
    enrollment_id: (0, pg_core_1.uuid)("enrollment_id").primaryKey().defaultRandom(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    course_id: (0, pg_core_1.uuid)("course_id").notNull(),
    institution_id: (0, pg_core_1.uuid)("institution_id"), // Institution that owns this enrollment
    enrollment_status: (0, exports.enrollmentStatusEnum)("enrollment_status").default("not_started"),
    enrolled_at: (0, pg_core_1.timestamp)("enrolled_at", { withTimezone: true }).defaultNow(),
    completed_at: (0, pg_core_1.timestamp)("completed_at", { withTimezone: true }),
    progress_percentage: (0, pg_core_1.doublePrecision)("progress_percentage").default(0),
    preferences: (0, pg_core_1.jsonb)("preferences"),
});
exports.courseEnrollmentsTable = exports.course_enrollments;
/**
 * LESSON_PROGRESS
 */
exports.lesson_progress = (0, pg_core_1.pgTable)("lesson_progress", {
    progress_id: (0, pg_core_1.uuid)("progress_id").primaryKey().defaultRandom(),
    enrollment_id: (0, pg_core_1.uuid)("enrollment_id").notNull(),
    lesson_id: (0, pg_core_1.uuid)("lesson_id").notNull(),
    status: (0, exports.lessonProgressStatusEnum)("status").default("not_started"),
    progress_percentage: (0, pg_core_1.doublePrecision)("progress_percentage").default(0),
    started_at: (0, pg_core_1.timestamp)("started_at", { withTimezone: true }),
    completed_at: (0, pg_core_1.timestamp)("completed_at", { withTimezone: true }),
    time_spent_minutes: (0, pg_core_1.integer)("time_spent_minutes").default(0),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    last_accessed: (0, pg_core_1.timestamp)("last_accessed", { withTimezone: true }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.lessonProgressTable = exports.lesson_progress;
/**
 * COURSE_CERTIFICATES
 */
exports.course_certificates = (0, pg_core_1.pgTable)("course_certificates", {
    certificate_id: (0, pg_core_1.uuid)("certificate_id").primaryKey().defaultRandom(),
    enrollment_id: (0, pg_core_1.uuid)("enrollment_id").notNull(),
    certificate_url: (0, pg_core_1.varchar)("certificate_url", { length: 1000 }),
    certificate_code: (0, pg_core_1.varchar)("certificate_code", { length: 128 }).notNull(),
    issued_by: (0, pg_core_1.uuid)("issued_by"),
    issued_at: (0, pg_core_1.timestamp)("issued_at", { withTimezone: true }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
exports.courseCertificatesTable = exports.course_certificates;
/**
 * LESSON_MEDIA
 */
exports.lesson_media = (0, pg_core_1.pgTable)("lesson_media", {
    media_id: (0, pg_core_1.uuid)("media_id").primaryKey().defaultRandom(),
    lesson_id: (0, pg_core_1.uuid)("lesson_id").notNull(),
    media_type: (0, exports.mediaTypeEnum)("media_type").notNull(),
    file_url: (0, pg_core_1.varchar)("file_url", { length: 1000 }),
    thumbnail_url: (0, pg_core_1.varchar)("thumbnail_url", { length: 1000 }),
    file_label: (0, pg_core_1.varchar)("file_label", { length: 512 }),
    file_size_bytes: (0, pg_core_1.integer)("file_size_bytes").default(0),
    duration_seconds: (0, pg_core_1.integer)("duration_seconds").default(0),
    mime_type: (0, pg_core_1.varchar)("mime_type", { length: 128 }),
    order_number: (0, pg_core_1.integer)("order_number").default(0),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.lessonMediaTable = exports.lesson_media;
/**
 * QUIZZES
 */
exports.quizzes = (0, pg_core_1.pgTable)("quizzes", {
    quiz_id: (0, pg_core_1.uuid)("quiz_id").primaryKey().defaultRandom(),
    lesson_id: (0, pg_core_1.uuid)("lesson_id").notNull(),
    title: (0, pg_core_1.varchar)("title", { length: 512 }),
    description: (0, pg_core_1.text)("description"),
    passing_score_percentage: (0, pg_core_1.doublePrecision)("passing_score_percentage").default(0),
    time_limit_minutes: (0, pg_core_1.integer)("time_limit_minutes").default(0),
    max_attempts: (0, pg_core_1.integer)("max_attempts").default(0),
    is_active: (0, pg_core_1.boolean)("is_active").default(true),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.quizzesTable = exports.quizzes;
/**
 * QUIZ_QUESTIONS
 */
exports.quiz_questions = (0, pg_core_1.pgTable)("quiz_questions", {
    question_id: (0, pg_core_1.uuid)("question_id").primaryKey().defaultRandom(),
    quiz_id: (0, pg_core_1.uuid)("quiz_id").notNull(),
    question_text: (0, pg_core_1.text)("question_text").notNull(),
    question_type: (0, exports.quizQuestionTypeEnum)("question_type").notNull(),
    points: (0, pg_core_1.integer)("points").default(0),
    order_number: (0, pg_core_1.integer)("order_number").default(0),
    explanation: (0, pg_core_1.text)("explanation"),
    media: (0, pg_core_1.jsonb)("media"),
    external_resources: (0, pg_core_1.jsonb)("external_resources"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.quizQuestionsTable = exports.quiz_questions;
/**
 * QUESTION_OPTIONS
 */
exports.question_options = (0, pg_core_1.pgTable)("question_options", {
    option_id: (0, pg_core_1.uuid)("option_id").primaryKey().defaultRandom(),
    question_id: (0, pg_core_1.uuid)("question_id").notNull(),
    option_text: (0, pg_core_1.text)("option_text").notNull(),
    is_correct: (0, pg_core_1.boolean)("is_correct").default(false),
    order_number: (0, pg_core_1.integer)("order_number").default(0),
    feedback: (0, pg_core_1.text)("feedback"),
});
exports.questionOptionsTable = exports.question_options;
/**
 * QUIZ_ATTEMPTS
 */
exports.quiz_attempts = (0, pg_core_1.pgTable)("quiz_attempts", {
    attempt_id: (0, pg_core_1.uuid)("attempt_id").primaryKey().defaultRandom(),
    enrollment_id: (0, pg_core_1.uuid)("enrollment_id").notNull(),
    quiz_id: (0, pg_core_1.uuid)("quiz_id").notNull(),
    score_percentage: (0, pg_core_1.doublePrecision)("score_percentage").default(0),
    score_points: (0, pg_core_1.integer)("score_points").default(0),
    total_points: (0, pg_core_1.integer)("total_points").default(0),
    started_at: (0, pg_core_1.timestamp)("started_at", { withTimezone: true }),
    completed_at: (0, pg_core_1.timestamp)("completed_at", { withTimezone: true }),
    attempt_number: (0, pg_core_1.integer)("attempt_number").default(1),
    time_taken_seconds: (0, pg_core_1.integer)("time_taken_seconds").default(0),
    status: (0, exports.quizAttemptStatusEnum)("status").default("in_progress"),
    passed: (0, pg_core_1.boolean)("passed").default(false),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
exports.quizAttemptsTable = exports.quiz_attempts;
/**
 * QUIZ_ANSWERS
 */
exports.quiz_answers = (0, pg_core_1.pgTable)("quiz_answers", {
    answer_id: (0, pg_core_1.uuid)("answer_id").primaryKey().defaultRandom(),
    attempt_id: (0, pg_core_1.uuid)("attempt_id").notNull(),
    question_id: (0, pg_core_1.uuid)("question_id").notNull(),
    selected_options: (0, pg_core_1.jsonb)("selected_options"),
    is_correct: (0, pg_core_1.boolean)("is_correct").default(false),
    points_earned: (0, pg_core_1.integer)("points_earned").default(0),
    time_taken_seconds: (0, pg_core_1.integer)("time_taken_seconds").default(0),
    answered_at: (0, pg_core_1.timestamp)("answered_at", { withTimezone: true }),
});
exports.quizAnswersTable = exports.quiz_answers;
/**
 * FORUMS
 */
exports.forums = (0, pg_core_1.pgTable)("forums", {
    forum_id: (0, pg_core_1.uuid)("forum_id").primaryKey().defaultRandom(),
    institution_id: (0, pg_core_1.uuid)("institution_id"), // Institution that owns this forum
    name: (0, pg_core_1.varchar)("name", { length: 256 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    slug: (0, pg_core_1.varchar)("slug", { length: 256 }).notNull(),
    category: (0, pg_core_1.varchar)("category", { length: 128 }),
    post_count: (0, pg_core_1.integer)("post_count").default(0),
    member_count: (0, pg_core_1.integer)("member_count").default(0),
    is_active: (0, pg_core_1.boolean)("is_active").default(true),
    display_order: (0, pg_core_1.integer)("display_order").default(0),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.forumsTable = exports.forums;
/**
 * FORUM_POSTS
 */
exports.forum_posts = (0, pg_core_1.pgTable)("forum_posts", {
    post_id: (0, pg_core_1.uuid)("post_id").primaryKey().defaultRandom(),
    forum_id: (0, pg_core_1.uuid)("forum_id").notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    title: (0, pg_core_1.varchar)("title", { length: 512 }),
    content: (0, pg_core_1.text)("content"),
    tags: (0, pg_core_1.jsonb)("tags"),
    view_count: (0, pg_core_1.integer)("view_count").default(0),
    like_count: (0, pg_core_1.integer)("like_count").default(0),
    dislike_count: (0, pg_core_1.integer)("dislike_count").default(0),
    comment_count: (0, pg_core_1.integer)("comment_count").default(0),
    is_solved: (0, pg_core_1.boolean)("is_solved").default(false),
    is_pinned: (0, pg_core_1.boolean)("is_pinned").default(false),
    is_locked: (0, pg_core_1.boolean)("is_locked").default(false),
    status: (0, exports.forumStatusEnum)("status").default("active"),
    delete_reason: (0, pg_core_1.text)("delete_reason"),
    deleted_by: (0, pg_core_1.uuid)("deleted_by"),
    last_activity: (0, pg_core_1.timestamp)("last_activity", { withTimezone: true }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
    deleted_at: (0, pg_core_1.timestamp)("deleted_at", { withTimezone: true }),
});
exports.forumPostsTable = exports.forum_posts;
/**
 * COMMENTS
 */
exports.comments = (0, pg_core_1.pgTable)("comments", {
    comment_id: (0, pg_core_1.uuid)("comment_id").primaryKey().defaultRandom(),
    post_id: (0, pg_core_1.uuid)("post_id").notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    parent_comment_id: (0, pg_core_1.uuid)("parent_comment_id"),
    content: (0, pg_core_1.text)("content").notNull(),
    like_count: (0, pg_core_1.integer)("like_count").default(0),
    dislike_count: (0, pg_core_1.integer)("dislike_count").default(0),
    is_solution: (0, pg_core_1.boolean)("is_solution").default(false),
    is_edited: (0, pg_core_1.boolean)("is_edited").default(false),
    status: (0, exports.commentStatusEnum)("status").default("active"),
    delete_reason: (0, pg_core_1.text)("delete_reason"),
    deleted_by: (0, pg_core_1.uuid)("deleted_by"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
    deleted_at: (0, pg_core_1.timestamp)("deleted_at", { withTimezone: true }),
});
exports.commentsTable = exports.comments;
/**
 * POST_REACTIONS
 */
exports.post_reactions = (0, pg_core_1.pgTable)("post_reactions", {
    reaction_id: (0, pg_core_1.uuid)("reaction_id").primaryKey().defaultRandom(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    post_id: (0, pg_core_1.uuid)("post_id"),
    comment_id: (0, pg_core_1.uuid)("comment_id"),
    reaction_type: (0, exports.reactionTypeEnum)("reaction_type").notNull(),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
exports.postReactionsTable = exports.post_reactions;
/**
 * POST_READ_STATUS
 */
exports.post_read_status = (0, pg_core_1.pgTable)("post_read_status", {
    read_status_id: (0, pg_core_1.uuid)("read_status_id").primaryKey().defaultRandom(),
    post_id: (0, pg_core_1.uuid)("post_id").notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    read_at: (0, pg_core_1.timestamp)("read_at", { withTimezone: true }),
});
exports.postReadStatusTable = exports.post_read_status;
/**
 * CHATROOMS
 */
exports.chatrooms = (0, pg_core_1.pgTable)("chatrooms", {
    chatroom_id: (0, pg_core_1.uuid)("chatroom_id").primaryKey().defaultRandom(),
    institution_id: (0, pg_core_1.uuid)("institution_id"), // Institution that owns this chatroom
    chatroom_type: (0, exports.chatroomTypeEnum)("chatroom_type").notNull(),
    name: (0, pg_core_1.varchar)("name", { length: 256 }),
    description: (0, pg_core_1.text)("description"),
    avatar_url: (0, pg_core_1.varchar)("avatar_url", { length: 1000 }),
    created_by: (0, pg_core_1.uuid)("created_by"),
    member_count: (0, pg_core_1.integer)("member_count").default(0),
    max_members: (0, pg_core_1.integer)("max_members"), // null means unlimited
    require_approval: (0, pg_core_1.boolean)("require_approval").default(false),
    last_message_id: (0, pg_core_1.uuid)("last_message_id"),
    last_activity: (0, pg_core_1.timestamp)("last_activity", { withTimezone: true }),
    settings: (0, pg_core_1.jsonb)("settings"),
    status: (0, exports.chatroomStatusEnum)("status").default("active"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.chatroomsTable = exports.chatrooms;
/**
 * CHATROOM_MEMBERS
 */
exports.chatroom_members = (0, pg_core_1.pgTable)("chatroom_members", {
    member_id: (0, pg_core_1.uuid)("member_id").primaryKey().defaultRandom(),
    chatroom_id: (0, pg_core_1.uuid)("chatroom_id").notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    role: (0, exports.chatMemberRoleEnum)("role").default("member"),
    permissions: (0, pg_core_1.jsonb)("permissions"),
    invited_by: (0, pg_core_1.uuid)("invited_by"), // who invited this member
    joined_at: (0, pg_core_1.timestamp)("joined_at", { withTimezone: true }).defaultNow(),
    last_read_at: (0, pg_core_1.timestamp)("last_read_at", { withTimezone: true }),
    unread_count: (0, pg_core_1.integer)("unread_count").default(0),
    is_muted: (0, pg_core_1.boolean)("is_muted").default(false),
    is_pinned: (0, pg_core_1.boolean)("is_pinned").default(false),
    status: (0, exports.chatMemberStatusEnum)("status").default("active"),
    left_at: (0, pg_core_1.timestamp)("left_at", { withTimezone: true }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.chatroomMembersTable = exports.chatroom_members;
/**
 * CHAT_MESSAGES
 */
exports.chat_messages = (0, pg_core_1.pgTable)("chat_messages", {
    message_id: (0, pg_core_1.uuid)("message_id").primaryKey().defaultRandom(),
    chatroom_id: (0, pg_core_1.uuid)("chatroom_id").notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    reply_to_message_id: (0, pg_core_1.uuid)("reply_to_message_id"),
    content: (0, pg_core_1.text)("content"),
    message_type: (0, exports.messageTypeEnum)("message_type").default("text"),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    is_edited: (0, pg_core_1.boolean)("is_edited").default(false),
    is_deleted: (0, pg_core_1.boolean)("is_deleted").default(false),
    deleted_reason: (0, pg_core_1.text)("deleted_reason"),
    reaction_count: (0, pg_core_1.integer)("reaction_count").default(0),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
    deleted_at: (0, pg_core_1.timestamp)("deleted_at", { withTimezone: true }),
});
exports.chatMessagesTable = exports.chat_messages;
/**
 * MESSAGE_ATTACHMENTS
 */
exports.message_attachments = (0, pg_core_1.pgTable)("message_attachments", {
    attachment_id: (0, pg_core_1.uuid)("attachment_id").primaryKey().defaultRandom(),
    message_id: (0, pg_core_1.uuid)("message_id").notNull(),
    file_type: (0, exports.attachmentFileTypeEnum)("file_type").notNull(),
    file_url: (0, pg_core_1.varchar)("file_url", { length: 1000 }).notNull(),
    thumbnail_url: (0, pg_core_1.varchar)("thumbnail_url", { length: 1000 }),
    file_name: (0, pg_core_1.varchar)("file_name", { length: 512 }),
    file_size_bytes: (0, pg_core_1.integer)("file_size_bytes").default(0),
    mime_type: (0, pg_core_1.varchar)("mime_type", { length: 128 }),
    duration_seconds: (0, pg_core_1.integer)("duration_seconds").default(0),
    uploaded_at: (0, pg_core_1.timestamp)("uploaded_at", { withTimezone: true }).defaultNow(),
});
exports.messageAttachmentsTable = exports.message_attachments;
/**
 * MESSAGE_READ_STATUS
 */
exports.message_read_status = (0, pg_core_1.pgTable)("message_read_status", {
    read_status_id: (0, pg_core_1.uuid)("read_status_id").primaryKey().defaultRandom(),
    message_id: (0, pg_core_1.uuid)("message_id").notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    read_at: (0, pg_core_1.timestamp)("read_at", { withTimezone: true }),
    delivered_at: (0, pg_core_1.timestamp)("delivered_at", { withTimezone: true }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.messageReadStatusTable = exports.message_read_status;
/**
 * MESSAGE_REACTIONS
 */
exports.message_reactions = (0, pg_core_1.pgTable)("message_reactions", {
    reaction_id: (0, pg_core_1.uuid)("reaction_id").primaryKey().defaultRandom(),
    message_id: (0, pg_core_1.uuid)("message_id").notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    emoji: (0, pg_core_1.varchar)("emoji", { length: 64 }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
exports.messageReactionsTable = exports.message_reactions;
/**
 * USER_REPORTS
 */
exports.user_reports = (0, pg_core_1.pgTable)("user_reports", {
    report_id: (0, pg_core_1.uuid)("report_id").primaryKey().defaultRandom(),
    reporter_user_id: (0, pg_core_1.uuid)("reporter_user_id").notNull(),
    reported_user_id: (0, pg_core_1.uuid)("reported_user_id"),
    post_id: (0, pg_core_1.uuid)("post_id"),
    comment_id: (0, pg_core_1.uuid)("comment_id"),
    message_id: (0, pg_core_1.uuid)("message_id"),
    report_type: (0, exports.reportTypeEnum)("report_type").notNull(),
    description: (0, pg_core_1.text)("description"),
    evidence: (0, pg_core_1.jsonb)("evidence"),
    status: (0, exports.reportStatusEnum)("status").default("pending"),
    reviewed_by_admin: (0, pg_core_1.uuid)("reviewed_by_admin"),
    admin_notes: (0, pg_core_1.text)("admin_notes"),
    action_taken: (0, exports.actionTakenEnum)("action_taken").default("none"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
    reviewed_at: (0, pg_core_1.timestamp)("reviewed_at", { withTimezone: true }),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.userReportsTable = exports.user_reports;
/**
 * SYSTEM_LOGS
 */
exports.system_logs = (0, pg_core_1.pgTable)("system_logs", {
    log_id: (0, pg_core_1.uuid)("log_id").primaryKey().defaultRandom(),
    user_id: (0, pg_core_1.uuid)("user_id"),
    action_type: (0, exports.actionTypeEnum)("action_type").notNull(),
    module: (0, exports.moduleEnum)("module").notNull(),
    description: (0, pg_core_1.text)("description"),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    ip_address: (0, pg_core_1.varchar)("ip_address", { length: 64 }),
    user_agent: (0, pg_core_1.varchar)("user_agent", { length: 1000 }),
    log_level: (0, exports.logLevelEnum)("log_level").default("info"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
exports.systemLogsTable = exports.system_logs;
/**
 * ANNOUNCEMENTS
 */
exports.announcements = (0, pg_core_1.pgTable)("announcements", {
    announcement_id: (0, pg_core_1.uuid)("announcement_id").primaryKey().defaultRandom(),
    institution_id: (0, pg_core_1.uuid)("institution_id"), // Institution that owns this announcement
    title: (0, pg_core_1.varchar)("title", { length: 512 }).notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    created_by: (0, pg_core_1.uuid)("created_by").notNull(),
    is_active: (0, pg_core_1.boolean)("is_active").default(true),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.announcementsTable = exports.announcements;
/**
 * WEATHER_DATA
 */
exports.weather_data = (0, pg_core_1.pgTable)("weather_data", {
    weather_id: (0, pg_core_1.uuid)("weather_id").primaryKey().defaultRandom(),
    location_id: (0, pg_core_1.uuid)("location_id").notNull(),
    timestamp: (0, pg_core_1.timestamp)("timestamp", { withTimezone: true }).notNull(),
    temperature_celsius: (0, pg_core_1.doublePrecision)("temperature_celsius"),
    humidity_percentage: (0, pg_core_1.doublePrecision)("humidity_percentage"),
    rainfall_mm: (0, pg_core_1.doublePrecision)("rainfall_mm"),
    conditions: (0, pg_core_1.varchar)("conditions", { length: 256 }),
    forecast_data: (0, pg_core_1.jsonb)("forecast_data"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.weatherDataTable = exports.weather_data;
/**
 * MEMBERSHIP_REQUESTS
 */
exports.membership_requests = (0, pg_core_1.pgTable)("membership_requests", {
    request_id: (0, pg_core_1.uuid)("request_id").primaryKey().defaultRandom(),
    chatroom_id: (0, pg_core_1.uuid)("chatroom_id").notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    requested_by: (0, pg_core_1.uuid)("requested_by"), // null if user self-requested
    message: (0, pg_core_1.text)("message"),
    status: (0, exports.membershipRequestStatusEnum)("status").default("pending"),
    reviewed_by: (0, pg_core_1.uuid)("reviewed_by"),
    reviewed_at: (0, pg_core_1.timestamp)("reviewed_at", { withTimezone: true }),
    response_message: (0, pg_core_1.text)("response_message"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.membershipRequestsTable = exports.membership_requests;
/**
 * MEMBERSHIP_LOGS
 */
exports.membership_logs = (0, pg_core_1.pgTable)("membership_logs", {
    log_id: (0, pg_core_1.uuid)("log_id").primaryKey().defaultRandom(),
    chatroom_id: (0, pg_core_1.uuid)("chatroom_id").notNull(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    action: (0, exports.membershipActionEnum)("action").notNull(),
    performed_by: (0, pg_core_1.uuid)("performed_by"), // who performed the action (null for self-actions)
    old_value: (0, pg_core_1.jsonb)("old_value"), // previous state (role, etc.)
    new_value: (0, pg_core_1.jsonb)("new_value"), // new state (role, etc.)
    reason: (0, pg_core_1.text)("reason"), // optional reason for the action
    metadata: (0, pg_core_1.jsonb)("metadata"), // additional context
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.membershipLogsTable = exports.membership_logs;
/**
 * CHATROOM_INVITATIONS
 */
exports.chatroom_invitations = (0, pg_core_1.pgTable)("chatroom_invitations", {
    invitation_id: (0, pg_core_1.uuid)("invitation_id").primaryKey().defaultRandom(),
    chatroom_id: (0, pg_core_1.uuid)("chatroom_id").notNull(),
    invited_user_id: (0, pg_core_1.uuid)("invited_user_id"),
    invited_email: (0, pg_core_1.varchar)("invited_email", { length: 320 }),
    invitation_code: (0, pg_core_1.varchar)("invitation_code", { length: 64 }).notNull().unique(),
    invited_by: (0, pg_core_1.uuid)("invited_by").notNull(),
    expires_at: (0, pg_core_1.timestamp)("expires_at", { withTimezone: true }),
    status: (0, exports.invitationStatusEnum)("status").default("pending"),
    accepted_at: (0, pg_core_1.timestamp)("accepted_at", { withTimezone: true }),
    message: (0, pg_core_1.text)("message"),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
    updated_at: (0, pg_core_1.timestamp)("updated_at", { withTimezone: true }),
});
exports.chatroomInvitationsTable = exports.chatroom_invitations;
/**
 * NOTIFICATIONS
 */
exports.notifications = (0, pg_core_1.pgTable)("notifications", {
    notification_id: (0, pg_core_1.uuid)("notification_id").primaryKey().defaultRandom(),
    user_id: (0, pg_core_1.uuid)("user_id").notNull(),
    type: (0, exports.notificationTypeEnum)("type").notNull(),
    title: (0, pg_core_1.varchar)("title", { length: 256 }).notNull(),
    message: (0, pg_core_1.text)("message").notNull(),
    related_chatroom_id: (0, pg_core_1.uuid)("related_chatroom_id"),
    related_user_id: (0, pg_core_1.uuid)("related_user_id"),
    related_message_id: (0, pg_core_1.uuid)("related_message_id"),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    is_read: (0, pg_core_1.boolean)("is_read").default(false),
    read_at: (0, pg_core_1.timestamp)("read_at", { withTimezone: true }),
    created_at: (0, pg_core_1.timestamp)("created_at", { withTimezone: true }).defaultNow(),
});
exports.notificationsTable = exports.notifications;
/**
 * RELATIONS
 *
 * We add relations for main entities so Drizzle's `relations()` helper
 * can be used by service code. This is verbose but helps type-safety.
 */
/* Users relations */
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ many, one }) => ({
    // user -> courses created
    courses_created: many(exports.courses),
    // user -> forum posts
    forum_posts: many(exports.forum_posts),
    // user -> comments
    comments: many(exports.comments),
    // user -> course_enrollments
    enrollments: many(exports.course_enrollments),
    // user -> course_ratings
    ratings: many(exports.course_ratings),
    // user -> system logs
    system_logs: many(exports.system_logs),
    // user -> institution
    institution: one(exports.institutions, { fields: [exports.users.institution_id], references: [exports.institutions.institution_id] }),
}));
/* Institutions relations */
exports.institutionsRelations = (0, drizzle_orm_1.relations)(exports.institutions, ({ many, one }) => ({
    // institution -> users
    users: many(exports.users),
    // institution -> creator (Super Admin)
    creator: one(exports.users, { fields: [exports.institutions.created_by], references: [exports.users.user_id] }),
}));
/* Locations relations */
exports.locationsRelations = (0, drizzle_orm_1.relations)(exports.locations, ({ many }) => ({
    users: many(exports.users),
    weather: many(exports.weather_data),
}));
/* Courses relations */
exports.coursesRelations = (0, drizzle_orm_1.relations)(exports.courses, ({ many, one }) => ({
    creator: one(exports.users, { fields: [exports.courses.creator_id], references: [exports.users.user_id] }),
    lessons: many(exports.lessons),
    enrollments: many(exports.course_enrollments),
    ratings: many(exports.course_ratings),
}));
/* Lessons relations */
exports.lessonsRelations = (0, drizzle_orm_1.relations)(exports.lessons, ({ one, many }) => ({
    course: one(exports.courses, { fields: [exports.lessons.course_id], references: [exports.courses.course_id] }),
    creator: one(exports.users, { fields: [exports.lessons.creator_id], references: [exports.users.user_id] }),
    media: many(exports.lesson_media),
    quizzes: many(exports.quizzes),
    progress: many(exports.lesson_progress),
}));
/* Course enrollments relations */
exports.courseEnrollmentsRelations = (0, drizzle_orm_1.relations)(exports.course_enrollments, ({ one, many }) => ({
    user: one(exports.users, { fields: [exports.course_enrollments.user_id], references: [exports.users.user_id] }),
    course: one(exports.courses, { fields: [exports.course_enrollments.course_id], references: [exports.courses.course_id] }),
    lesson_progress: many(exports.lesson_progress),
    quiz_attempts: many(exports.quiz_attempts),
    certificates: many(exports.course_certificates),
}));
/* Lesson progress relations */
exports.lessonProgressRelations = (0, drizzle_orm_1.relations)(exports.lesson_progress, ({ one }) => ({
    enrollment: one(exports.course_enrollments, { fields: [exports.lesson_progress.enrollment_id], references: [exports.course_enrollments.enrollment_id] }),
    lesson: one(exports.lessons, { fields: [exports.lesson_progress.lesson_id], references: [exports.lessons.lesson_id] }),
}));
/* Course certificates relations */
exports.courseCertificatesRelations = (0, drizzle_orm_1.relations)(exports.course_certificates, ({ one }) => ({
    enrollment: one(exports.course_enrollments, { fields: [exports.course_certificates.enrollment_id], references: [exports.course_enrollments.enrollment_id] }),
    issued_by: one(exports.users, { fields: [exports.course_certificates.issued_by], references: [exports.users.user_id] }),
}));
/* Lesson media relations */
exports.lessonMediaRelations = (0, drizzle_orm_1.relations)(exports.lesson_media, ({ one }) => ({
    lesson: one(exports.lessons, { fields: [exports.lesson_media.lesson_id], references: [exports.lessons.lesson_id] }),
}));
/* Quizzes relations */
exports.quizzesRelations = (0, drizzle_orm_1.relations)(exports.quizzes, ({ one, many }) => ({
    lesson: one(exports.lessons, { fields: [exports.quizzes.lesson_id], references: [exports.lessons.lesson_id] }),
    questions: many(exports.quiz_questions),
    attempts: many(exports.quiz_attempts),
}));
/* Quiz questions relations */
exports.quizQuestionsRelations = (0, drizzle_orm_1.relations)(exports.quiz_questions, ({ one, many }) => ({
    quiz: one(exports.quizzes, { fields: [exports.quiz_questions.quiz_id], references: [exports.quizzes.quiz_id] }),
    options: many(exports.question_options),
    answers: many(exports.quiz_answers),
}));
/* Question options relations */
exports.questionOptionsRelations = (0, drizzle_orm_1.relations)(exports.question_options, ({ one }) => ({
    question: one(exports.quiz_questions, { fields: [exports.question_options.question_id], references: [exports.quiz_questions.question_id] }),
}));
/* Quiz attempts relations */
exports.quizAttemptsRelations = (0, drizzle_orm_1.relations)(exports.quiz_attempts, ({ one, many }) => ({
    enrollment: one(exports.course_enrollments, { fields: [exports.quiz_attempts.enrollment_id], references: [exports.course_enrollments.enrollment_id] }),
    quiz: one(exports.quizzes, { fields: [exports.quiz_attempts.quiz_id], references: [exports.quizzes.quiz_id] }),
    answers: many(exports.quiz_answers),
}));
/* Quiz answers relations */
exports.quizAnswersRelations = (0, drizzle_orm_1.relations)(exports.quiz_answers, ({ one }) => ({
    attempt: one(exports.quiz_attempts, { fields: [exports.quiz_answers.attempt_id], references: [exports.quiz_attempts.attempt_id] }),
    question: one(exports.quiz_questions, { fields: [exports.quiz_answers.question_id], references: [exports.quiz_questions.question_id] }),
}));
/* Forums & posts relations */
exports.forumsRelations = (0, drizzle_orm_1.relations)(exports.forums, ({ many }) => ({
    posts: many(exports.forum_posts),
}));
exports.forumPostsRelations = (0, drizzle_orm_1.relations)(exports.forum_posts, ({ one, many }) => ({
    forum: one(exports.forums, { fields: [exports.forum_posts.forum_id], references: [exports.forums.forum_id] }),
    author: one(exports.users, { fields: [exports.forum_posts.user_id], references: [exports.users.user_id] }),
    comments: many(exports.comments),
    reactions: many(exports.post_reactions),
    read_status: many(exports.post_read_status),
}));
/* Comments relations */
exports.commentsRelations = (0, drizzle_orm_1.relations)(exports.comments, ({ one, many }) => ({
    post: one(exports.forum_posts, { fields: [exports.comments.post_id], references: [exports.forum_posts.post_id] }),
    author: one(exports.users, { fields: [exports.comments.user_id], references: [exports.users.user_id] }),
    parent: one(exports.comments, { fields: [exports.comments.parent_comment_id], references: [exports.comments.comment_id] }),
    replies: many(exports.comments),
    reactions: many(exports.post_reactions),
}));
/* Post reactions relations */
exports.postReactionsRelations = (0, drizzle_orm_1.relations)(exports.post_reactions, ({ one }) => ({
    user: one(exports.users, { fields: [exports.post_reactions.user_id], references: [exports.users.user_id] }),
    post: one(exports.forum_posts, { fields: [exports.post_reactions.post_id], references: [exports.forum_posts.post_id] }),
    comment: one(exports.comments, { fields: [exports.post_reactions.comment_id], references: [exports.comments.comment_id] }),
}));
/* Post read status relations */
exports.postReadStatusRelations = (0, drizzle_orm_1.relations)(exports.post_read_status, ({ one }) => ({
    post: one(exports.forum_posts, { fields: [exports.post_read_status.post_id], references: [exports.forum_posts.post_id] }),
    user: one(exports.users, { fields: [exports.post_read_status.user_id], references: [exports.users.user_id] }),
}));
/* Chatroom relations */
exports.chatroomsRelations = (0, drizzle_orm_1.relations)(exports.chatrooms, ({ one, many }) => ({
    creator: one(exports.users, { fields: [exports.chatrooms.created_by], references: [exports.users.user_id] }),
    members: many(exports.chatroom_members),
    messages: many(exports.chat_messages),
    membershipRequests: many(exports.membership_requests),
    membershipLogs: many(exports.membership_logs),
    invitations: many(exports.chatroom_invitations),
}));
/* Chatroom members relations */
exports.chatroomMembersRelations = (0, drizzle_orm_1.relations)(exports.chatroom_members, ({ one }) => ({
    chatroom: one(exports.chatrooms, { fields: [exports.chatroom_members.chatroom_id], references: [exports.chatrooms.chatroom_id] }),
    user: one(exports.users, { fields: [exports.chatroom_members.user_id], references: [exports.users.user_id] }),
    invitedBy: one(exports.users, { fields: [exports.chatroom_members.invited_by], references: [exports.users.user_id] }),
}));
/* Chat messages relations */
exports.chatMessagesRelations = (0, drizzle_orm_1.relations)(exports.chat_messages, ({ one, many }) => ({
    chatroom: one(exports.chatrooms, { fields: [exports.chat_messages.chatroom_id], references: [exports.chatrooms.chatroom_id] }),
    author: one(exports.users, { fields: [exports.chat_messages.user_id], references: [exports.users.user_id] }),
    reply_to: one(exports.chat_messages, { fields: [exports.chat_messages.reply_to_message_id], references: [exports.chat_messages.message_id] }),
    attachments: many(exports.message_attachments),
    reactions: many(exports.message_reactions),
    read_status: many(exports.message_read_status),
}));
/* Message attachments relations */
exports.messageAttachmentsRelations = (0, drizzle_orm_1.relations)(exports.message_attachments, ({ one }) => ({
    message: one(exports.chat_messages, { fields: [exports.message_attachments.message_id], references: [exports.chat_messages.message_id] }),
}));
/* Message read status relations */
exports.messageReadStatusRelations = (0, drizzle_orm_1.relations)(exports.message_read_status, ({ one }) => ({
    message: one(exports.chat_messages, { fields: [exports.message_read_status.message_id], references: [exports.chat_messages.message_id] }),
    user: one(exports.users, { fields: [exports.message_read_status.user_id], references: [exports.users.user_id] }),
}));
/* Message reactions relations */
exports.messageReactionsRelations = (0, drizzle_orm_1.relations)(exports.message_reactions, ({ one }) => ({
    message: one(exports.chat_messages, { fields: [exports.message_reactions.message_id], references: [exports.chat_messages.message_id] }),
    user: one(exports.users, { fields: [exports.message_reactions.user_id], references: [exports.users.user_id] }),
}));
/* Membership requests relations */
exports.membershipRequestsRelations = (0, drizzle_orm_1.relations)(exports.membership_requests, ({ one }) => ({
    chatroom: one(exports.chatrooms, { fields: [exports.membership_requests.chatroom_id], references: [exports.chatrooms.chatroom_id] }),
    user: one(exports.users, { fields: [exports.membership_requests.user_id], references: [exports.users.user_id] }),
    requestedBy: one(exports.users, { fields: [exports.membership_requests.requested_by], references: [exports.users.user_id] }),
    reviewedBy: one(exports.users, { fields: [exports.membership_requests.reviewed_by], references: [exports.users.user_id] }),
}));
/* Membership logs relations */
exports.membershipLogsRelations = (0, drizzle_orm_1.relations)(exports.membership_logs, ({ one }) => ({
    chatroom: one(exports.chatrooms, { fields: [exports.membership_logs.chatroom_id], references: [exports.chatrooms.chatroom_id] }),
    user: one(exports.users, { fields: [exports.membership_logs.user_id], references: [exports.users.user_id] }),
    performedBy: one(exports.users, { fields: [exports.membership_logs.performed_by], references: [exports.users.user_id] }),
}));
/* Chatroom invitations relations */
exports.chatroomInvitationsRelations = (0, drizzle_orm_1.relations)(exports.chatroom_invitations, ({ one }) => ({
    chatroom: one(exports.chatrooms, { fields: [exports.chatroom_invitations.chatroom_id], references: [exports.chatrooms.chatroom_id] }),
    invitedUser: one(exports.users, { fields: [exports.chatroom_invitations.invited_user_id], references: [exports.users.user_id] }),
    invitedBy: one(exports.users, { fields: [exports.chatroom_invitations.invited_by], references: [exports.users.user_id] }),
}));
/* Notifications relations */
exports.notificationsRelations = (0, drizzle_orm_1.relations)(exports.notifications, ({ one }) => ({
    user: one(exports.users, { fields: [exports.notifications.user_id], references: [exports.users.user_id] }),
    relatedChatroom: one(exports.chatrooms, { fields: [exports.notifications.related_chatroom_id], references: [exports.chatrooms.chatroom_id] }),
    relatedUser: one(exports.users, { fields: [exports.notifications.related_user_id], references: [exports.users.user_id] }),
    relatedMessage: one(exports.chat_messages, { fields: [exports.notifications.related_message_id], references: [exports.chat_messages.message_id] }),
}));
/* User reports relations */
exports.userReportsRelations = (0, drizzle_orm_1.relations)(exports.user_reports, ({ one }) => ({
    reporter: one(exports.users, { fields: [exports.user_reports.reporter_user_id], references: [exports.users.user_id] }),
    reported: one(exports.users, { fields: [exports.user_reports.reported_user_id], references: [exports.users.user_id] }),
    reviewed_by: one(exports.users, { fields: [exports.user_reports.reviewed_by_admin], references: [exports.users.user_id] }),
    post: one(exports.forum_posts, { fields: [exports.user_reports.post_id], references: [exports.forum_posts.post_id] }),
    comment: one(exports.comments, { fields: [exports.user_reports.comment_id], references: [exports.comments.comment_id] }),
    message: one(exports.chat_messages, { fields: [exports.user_reports.message_id], references: [exports.chat_messages.message_id] }),
}));
/* System logs relations */
exports.systemLogsRelations = (0, drizzle_orm_1.relations)(exports.system_logs, ({ one }) => ({
    user: one(exports.users, { fields: [exports.system_logs.user_id], references: [exports.users.user_id] }),
}));
/* Announcements relations */
exports.announcementsRelations = (0, drizzle_orm_1.relations)(exports.announcements, ({ one }) => ({
    creator: one(exports.users, { fields: [exports.announcements.created_by], references: [exports.users.user_id] }),
}));
/* Weather data relations */
exports.weatherDataRelations = (0, drizzle_orm_1.relations)(exports.weather_data, ({ one }) => ({
    location: one(exports.locations, { fields: [exports.weather_data.location_id], references: [exports.locations.location_id] }),
}));
