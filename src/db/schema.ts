// src/db/schema.ts
import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { InferModel } from "drizzle-orm";

/**
 * Enums
 */
export const rolesEnum = pgEnum("roles", [
  "student",
  "farmer",
  "admin",
  "super_admin",
]);

export const courseStatusEnum = pgEnum("course_status", [
  "draft",
  "unpublished",
  "published",
]);

export const lessonStatusEnum = pgEnum("lesson_status", ["draft", "published"]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "not_started",
  "in_progress",
  "completed",
  "dropped",
]);

export const lessonProgressStatusEnum = pgEnum("lesson_progress_status", [
  "not_started",
  "in_progress",
  "completed",
]);

export const mediaTypeEnum = pgEnum("media_type", [
  "video",
  "pdf",
  "image",
  "audio",
  "document",
]);

export const quizQuestionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "true_false",
  "multiple_answer",
]);

export const quizAttemptStatusEnum = pgEnum("quiz_attempt_status", [
  "in_progress",
  "completed",
  "abandoned",
]);

export const forumStatusEnum = pgEnum("forum_status", [
  "active",
  "deleted",
  "flagged",
  "archived",
]);

export const commentStatusEnum = pgEnum("comment_status", [
  "active",
  "deleted",
  "flagged",
]);

export const reactionTypeEnum = pgEnum("reaction_type", ["like", "dislike"]);

export const chatroomTypeEnum = pgEnum("chatroom_type", [
  "direct",
  "group",
  "topic_based",
]);

export const chatroomStatusEnum = pgEnum("chatroom_status", [
  "active",
  "archived",
]);

export const chatMemberRoleEnum = pgEnum("chat_member_role", [
  "admin",
  "moderator",
  "member",
]);

export const chatMemberStatusEnum = pgEnum("chat_member_status", [
  "active",
  "left",
  "removed",
  "banned",
]);

export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "image",
  "video",
  "audio",
  "file",
  "system",
]);

export const attachmentFileTypeEnum = pgEnum("attachment_file_type", [
  "image",
  "video",
  "audio",
  "document",
  "pdf",
]);

export const reportTypeEnum = pgEnum("report_type", [
  "spam",
  "harassment",
  "inappropriate",
  "misinformation",
]);

export const reportStatusEnum = pgEnum("report_status", [
  "pending",
  "in_review",
  "resolved",
  "dismissed",
]);

export const actionTakenEnum = pgEnum("action_taken", [
  "none",
  "warning",
  "content_removed",
  "user_suspended",
  "user_banned",
]);

export const actionTypeEnum = pgEnum("action_type", [
  "login",
  "logout",
  "content_upload",
  "user_delete",
  "api_call",
  "admin_action",
]);

export const membershipRequestStatusEnum = pgEnum("membership_request_status", [
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "expired",
  "cancelled",
]);

export const membershipActionEnum = pgEnum("membership_action", [
  "join",
  "leave",
  "added",
  "removed",
  "role_changed",
  "banned",
  "unbanned",
]);

export const notificationTypeEnum = pgEnum("notification_type", [
  "message",
  "member_join",
  "member_leave",
  "member_added",
  "member_removed",
  "invitation",
  "request_approved",
  "request_rejected",
]);

export const moduleEnum = pgEnum("module_type", [
  "auth",
  "forum",
  "chat",
  "course",
  "admin",
  "system",
]);

export const logLevelEnum = pgEnum("log_level", [
  "info",
  "warning",
  "error",
  "critical",
]);

/**
 * TABLES
 */

/**
 * USERS
 */
export const users = pgTable(
  "users",
  {
    user_id: uuid("user_id").primaryKey().defaultRandom(),
    clerk_user_id: varchar("clerk_user_id", { length: 128 }).unique(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    first_name: varchar("first_name", { length: 128 }),
    last_name: varchar("last_name", { length: 128 }),
    image_url: varchar("image_url", { length: 1000 }),
    created_at: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }),
    last_login: timestamp("last_login", { withTimezone: true }),
    is_active: boolean("is_active").default(true).notNull(),
  },
  () => [
    // unique constraints
    // clerk_user_id optional unique
    // NOTE: Drizzle uniqueIndex helper is used as table-level indexes
    // we add unique indexes where ERD specified UK
    // (the API for uniqueIndex is available via the same core import in some versions;
    //  here we use a simple approach - define unique indexes via callback helpers)
    // but to keep compatibility we won't call unknown helpers; instead rely on DB migrations to create unique constraints if desired.
  ]
);

export type User = InferModel<typeof users>;
export type NewUser = InferModel<typeof users, "insert">;

/**
 * LOCATIONS
 */
export const locations = pgTable("locations", {
  location_id: uuid("location_id").primaryKey().defaultRandom(),
  location_name: varchar("location_name", { length: 256 }),
  country: varchar("country", { length: 128 }),
  country_code: varchar("country_code", { length: 8 }),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  timezone: varchar("timezone", { length: 64 }),
  location_details: jsonb("location_details"),
  user_count: integer("user_count").default(0),
});

export type Location = InferModel<typeof locations>;
export type NewLocation = InferModel<typeof locations, "insert">;

/**
 * COURSES
 */
export const courses = pgTable("courses", {
  course_id: uuid("course_id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  language: varchar("language", { length: 16 }),
  thumbnail_url: varchar("thumbnail_url", { length: 1000 }),
  total_lessons: integer("total_lessons").default(0),
  total_duration_minutes: integer("total_duration_minutes").default(0),
  average_rating: doublePrecision("average_rating").default(0),
  rating_count: integer("rating_count").default(0),
  status: courseStatusEnum("status").default("draft"),
  creator_id: uuid("creator_id"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type Course = InferModel<typeof courses>;
export type NewCourse = InferModel<typeof courses, "insert">;

/**
 * COURSE_RATINGS
 */
export const course_ratings = pgTable("course_ratings", {
  rating_id: uuid("rating_id").primaryKey().defaultRandom(),
  course_id: uuid("course_id").notNull(),
  user_id: uuid("user_id").notNull(),
  rating_value: integer("rating_value").notNull(),
  review_text: text("review_text"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type CourseRating = InferModel<typeof course_ratings>;
export type NewCourseRating = InferModel<typeof course_ratings, "insert">;

/**
 * LESSONS
 */
export const lessons = pgTable("lessons", {
  lesson_id: uuid("lesson_id").primaryKey().defaultRandom(),
  course_id: uuid("course_id").notNull(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  duration_minutes: integer("duration_minutes").default(0),
  order_number: integer("order_number").default(0),
  is_mandatory: boolean("is_mandatory").default(false),
  metadata: jsonb("metadata"),
  status: lessonStatusEnum("status").default("draft"),
  creator_id: uuid("creator_id"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type Lesson = InferModel<typeof lessons>;
export type NewLesson = InferModel<typeof lessons, "insert">;

/**
 * COURSE_ENROLLMENTS
 */
export const course_enrollments = pgTable("course_enrollments", {
  enrollment_id: uuid("enrollment_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  course_id: uuid("course_id").notNull(),
  enrollment_status: enrollmentStatusEnum("enrollment_status").default(
    "not_started"
  ),
  enrolled_at: timestamp("enrolled_at", { withTimezone: true }).defaultNow(),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  progress_percentage: doublePrecision("progress_percentage").default(0),
  preferences: jsonb("preferences"),
});

export type CourseEnrollment = InferModel<typeof course_enrollments>;
export type NewCourseEnrollment = InferModel<typeof course_enrollments, "insert">;

/**
 * LESSON_PROGRESS
 */
export const lesson_progress = pgTable("lesson_progress", {
  progress_id: uuid("progress_id").primaryKey().defaultRandom(),
  enrollment_id: uuid("enrollment_id").notNull(),
  lesson_id: uuid("lesson_id").notNull(),
  status: lessonProgressStatusEnum("status").default("not_started"),
  progress_percentage: doublePrecision("progress_percentage").default(0),
  started_at: timestamp("started_at", { withTimezone: true }),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  time_spent_minutes: integer("time_spent_minutes").default(0),
  metadata: jsonb("metadata"),
  last_accessed: timestamp("last_accessed", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type LessonProgress = InferModel<typeof lesson_progress>;
export type NewLessonProgress = InferModel<typeof lesson_progress, "insert">;

/**
 * COURSE_CERTIFICATES
 */
export const course_certificates = pgTable("course_certificates", {
  certificate_id: uuid("certificate_id").primaryKey().defaultRandom(),
  enrollment_id: uuid("enrollment_id").notNull(),
  certificate_url: varchar("certificate_url", { length: 1000 }),
  certificate_code: varchar("certificate_code", { length: 128 }).notNull(),
  issued_by: uuid("issued_by"),
  issued_at: timestamp("issued_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type CourseCertificate = InferModel<typeof course_certificates>;
export type NewCourseCertificate = InferModel<
  typeof course_certificates,
  "insert"
>;

/**
 * LESSON_MEDIA
 */
export const lesson_media = pgTable("lesson_media", {
  media_id: uuid("media_id").primaryKey().defaultRandom(),
  lesson_id: uuid("lesson_id").notNull(),
  media_type: mediaTypeEnum("media_type").notNull(),
  file_url: varchar("file_url", { length: 1000 }),
  thumbnail_url: varchar("thumbnail_url", { length: 1000 }),
  file_label: varchar("file_label", { length: 512 }),
  file_size_bytes: integer("file_size_bytes").default(0),
  duration_seconds: integer("duration_seconds").default(0),
  mime_type: varchar("mime_type", { length: 128 }),
  order_number: integer("order_number").default(0),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type LessonMedia = InferModel<typeof lesson_media>;
export type NewLessonMedia = InferModel<typeof lesson_media, "insert">;

/**
 * QUIZZES
 */
export const quizzes = pgTable("quizzes", {
  quiz_id: uuid("quiz_id").primaryKey().defaultRandom(),
  lesson_id: uuid("lesson_id").notNull(),
  title: varchar("title", { length: 512 }),
  description: text("description"),
  passing_score_percentage: doublePrecision("passing_score_percentage").default(0),
  time_limit_minutes: integer("time_limit_minutes").default(0),
  max_attempts: integer("max_attempts").default(0),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type Quiz = InferModel<typeof quizzes>;
export type NewQuiz = InferModel<typeof quizzes, "insert">;

/**
 * QUIZ_QUESTIONS
 */
export const quiz_questions = pgTable("quiz_questions", {
  question_id: uuid("question_id").primaryKey().defaultRandom(),
  quiz_id: uuid("quiz_id").notNull(),
  question_text: text("question_text").notNull(),
  question_type: quizQuestionTypeEnum("question_type").notNull(),
  points: integer("points").default(0),
  order_number: integer("order_number").default(0),
  explanation: text("explanation"),
  media: jsonb("media"),
  external_resources: jsonb("external_resources"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type QuizQuestion = InferModel<typeof quiz_questions>;
export type NewQuizQuestion = InferModel<typeof quiz_questions, "insert">;

/**
 * QUESTION_OPTIONS
 */
export const question_options = pgTable("question_options", {
  option_id: uuid("option_id").primaryKey().defaultRandom(),
  question_id: uuid("question_id").notNull(),
  option_text: text("option_text").notNull(),
  is_correct: boolean("is_correct").default(false),
  order_number: integer("order_number").default(0),
  feedback: text("feedback"),
});

export type QuestionOption = InferModel<typeof question_options>;
export type NewQuestionOption = InferModel<typeof question_options, "insert">;

/**
 * QUIZ_ATTEMPTS
 */
export const quiz_attempts = pgTable("quiz_attempts", {
  attempt_id: uuid("attempt_id").primaryKey().defaultRandom(),
  enrollment_id: uuid("enrollment_id").notNull(),
  quiz_id: uuid("quiz_id").notNull(),
  score_percentage: doublePrecision("score_percentage").default(0),
  score_points: integer("score_points").default(0),
  total_points: integer("total_points").default(0),
  started_at: timestamp("started_at", { withTimezone: true }),
  completed_at: timestamp("completed_at", { withTimezone: true }),
  attempt_number: integer("attempt_number").default(1),
  time_taken_seconds: integer("time_taken_seconds").default(0),
  status: quizAttemptStatusEnum("status").default("in_progress"),
  passed: boolean("passed").default(false),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type QuizAttempt = InferModel<typeof quiz_attempts>;
export type NewQuizAttempt = InferModel<typeof quiz_attempts, "insert">;

/**
 * QUIZ_ANSWERS
 */
export const quiz_answers = pgTable("quiz_answers", {
  answer_id: uuid("answer_id").primaryKey().defaultRandom(),
  attempt_id: uuid("attempt_id").notNull(),
  question_id: uuid("question_id").notNull(),
  selected_options: jsonb("selected_options"),
  is_correct: boolean("is_correct").default(false),
  points_earned: integer("points_earned").default(0),
  time_taken_seconds: integer("time_taken_seconds").default(0),
  answered_at: timestamp("answered_at", { withTimezone: true }),
});

export type QuizAnswer = InferModel<typeof quiz_answers>;
export type NewQuizAnswer = InferModel<typeof quiz_answers, "insert">;

/**
 * FORUMS
 */
export const forums = pgTable("forums", {
  forum_id: uuid("forum_id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 256 }).notNull(),
  category: varchar("category", { length: 128 }),
  post_count: integer("post_count").default(0),
  member_count: integer("member_count").default(0),
  is_active: boolean("is_active").default(true),
  display_order: integer("display_order").default(0),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type Forum = InferModel<typeof forums>;
export type NewForum = InferModel<typeof forums, "insert">;

/**
 * FORUM_POSTS
 */
export const forum_posts = pgTable("forum_posts", {
  post_id: uuid("post_id").primaryKey().defaultRandom(),
  forum_id: uuid("forum_id").notNull(),
  user_id: uuid("user_id").notNull(),
  title: varchar("title", { length: 512 }),
  content: text("content"),
  tags: jsonb("tags"),
  view_count: integer("view_count").default(0),
  like_count: integer("like_count").default(0),
  dislike_count: integer("dislike_count").default(0),
  comment_count: integer("comment_count").default(0),
  is_solved: boolean("is_solved").default(false),
  is_pinned: boolean("is_pinned").default(false),
  is_locked: boolean("is_locked").default(false),
  status: forumStatusEnum("status").default("active"),
  delete_reason: text("delete_reason"),
  deleted_by: uuid("deleted_by"),
  last_activity: timestamp("last_activity", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

export type ForumPost = InferModel<typeof forum_posts>;
export type NewForumPost = InferModel<typeof forum_posts, "insert">;

/**
 * COMMENTS
 */
export const comments = pgTable("comments", {
  comment_id: uuid("comment_id").primaryKey().defaultRandom(),
  post_id: uuid("post_id").notNull(),
  user_id: uuid("user_id").notNull(),
  parent_comment_id: uuid("parent_comment_id"),
  content: text("content").notNull(),
  like_count: integer("like_count").default(0),
  dislike_count: integer("dislike_count").default(0),
  is_solution: boolean("is_solution").default(false),
  is_edited: boolean("is_edited").default(false),
  status: commentStatusEnum("status").default("active"),
  delete_reason: text("delete_reason"),
  deleted_by: uuid("deleted_by"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

export type Comment = InferModel<typeof comments>;
export type NewComment = InferModel<typeof comments, "insert">;

/**
 * POST_REACTIONS
 */
export const post_reactions = pgTable("post_reactions", {
  reaction_id: uuid("reaction_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  post_id: uuid("post_id"),
  comment_id: uuid("comment_id"),
  reaction_type: reactionTypeEnum("reaction_type").notNull(),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type PostReaction = InferModel<typeof post_reactions>;
export type NewPostReaction = InferModel<typeof post_reactions, "insert">;

/**
 * POST_READ_STATUS
 */
export const post_read_status = pgTable("post_read_status", {
  read_status_id: uuid("read_status_id").primaryKey().defaultRandom(),
  post_id: uuid("post_id").notNull(),
  user_id: uuid("user_id").notNull(),
  read_at: timestamp("read_at", { withTimezone: true }),
});

export type PostReadStatus = InferModel<typeof post_read_status>;
export type NewPostReadStatus = InferModel<typeof post_read_status, "insert">;

/**
 * CHATROOMS
 */
export const chatrooms = pgTable("chatrooms", {
  chatroom_id: uuid("chatroom_id").primaryKey().defaultRandom(),
  chatroom_type: chatroomTypeEnum("chatroom_type").notNull(),
  name: varchar("name", { length: 256 }),
  description: text("description"),
  avatar_url: varchar("avatar_url", { length: 1000 }),
  created_by: uuid("created_by"),
  member_count: integer("member_count").default(0),
  max_members: integer("max_members"), // null means unlimited
  require_approval: boolean("require_approval").default(false),
  last_message_id: uuid("last_message_id"),
  last_activity: timestamp("last_activity", { withTimezone: true }),
  settings: jsonb("settings"),
  status: chatroomStatusEnum("status").default("active"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type Chatroom = InferModel<typeof chatrooms>;
export type NewChatroom = InferModel<typeof chatrooms, "insert">;

/**
 * CHATROOM_MEMBERS
 */
export const chatroom_members = pgTable("chatroom_members", {
  member_id: uuid("member_id").primaryKey().defaultRandom(),
  chatroom_id: uuid("chatroom_id").notNull(),
  user_id: uuid("user_id").notNull(),
  role: chatMemberRoleEnum("role").default("member"),
  permissions: jsonb("permissions"),
  invited_by: uuid("invited_by"), // who invited this member
  joined_at: timestamp("joined_at", { withTimezone: true }).defaultNow(),
  last_read_at: timestamp("last_read_at", { withTimezone: true }),
  unread_count: integer("unread_count").default(0),
  is_muted: boolean("is_muted").default(false),
  is_pinned: boolean("is_pinned").default(false),
  status: chatMemberStatusEnum("status").default("active"),
  left_at: timestamp("left_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type ChatroomMember = InferModel<typeof chatroom_members>;
export type NewChatroomMember = InferModel<typeof chatroom_members, "insert">;

/**
 * CHAT_MESSAGES
 */
export const chat_messages = pgTable("chat_messages", {
  message_id: uuid("message_id").primaryKey().defaultRandom(),
  chatroom_id: uuid("chatroom_id").notNull(),
  user_id: uuid("user_id").notNull(),
  reply_to_message_id: uuid("reply_to_message_id"),
  content: text("content"),
  message_type: messageTypeEnum("message_type").default("text"),
  metadata: jsonb("metadata"),
  is_edited: boolean("is_edited").default(false),
  is_deleted: boolean("is_deleted").default(false),
  deleted_reason: text("deleted_reason"),
  reaction_count: integer("reaction_count").default(0),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
  deleted_at: timestamp("deleted_at", { withTimezone: true }),
});

export type ChatMessage = InferModel<typeof chat_messages>;
export type NewChatMessage = InferModel<typeof chat_messages, "insert">;

/**
 * MESSAGE_ATTACHMENTS
 */
export const message_attachments = pgTable("message_attachments", {
  attachment_id: uuid("attachment_id").primaryKey().defaultRandom(),
  message_id: uuid("message_id").notNull(),
  file_type: attachmentFileTypeEnum("file_type").notNull(),
  file_url: varchar("file_url", { length: 1000 }).notNull(),
  thumbnail_url: varchar("thumbnail_url", { length: 1000 }),
  file_name: varchar("file_name", { length: 512 }),
  file_size_bytes: integer("file_size_bytes").default(0),
  mime_type: varchar("mime_type", { length: 128 }),
  duration_seconds: integer("duration_seconds").default(0),
  uploaded_at: timestamp("uploaded_at", { withTimezone: true }).defaultNow(),
});

export type MessageAttachment = InferModel<typeof message_attachments>;
export type NewMessageAttachment = InferModel<typeof message_attachments, "insert">;

/**
 * MESSAGE_READ_STATUS
 */
export const message_read_status = pgTable("message_read_status", {
  read_status_id: uuid("read_status_id").primaryKey().defaultRandom(),
  message_id: uuid("message_id").notNull(),
  user_id: uuid("user_id").notNull(),
  read_at: timestamp("read_at", { withTimezone: true }),
  delivered_at: timestamp("delivered_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type MessageReadStatus = InferModel<typeof message_read_status>;
export type NewMessageReadStatus = InferModel<typeof message_read_status, "insert">;

/**
 * MESSAGE_REACTIONS
 */
export const message_reactions = pgTable("message_reactions", {
  reaction_id: uuid("reaction_id").primaryKey().defaultRandom(),
  message_id: uuid("message_id").notNull(),
  user_id: uuid("user_id").notNull(),
  emoji: varchar("emoji", { length: 64 }),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type MessageReaction = InferModel<typeof message_reactions>;
export type NewMessageReaction = InferModel<typeof message_reactions, "insert">;

/**
 * USER_REPORTS
 */
export const user_reports = pgTable("user_reports", {
  report_id: uuid("report_id").primaryKey().defaultRandom(),
  reporter_user_id: uuid("reporter_user_id").notNull(),
  reported_user_id: uuid("reported_user_id"),
  post_id: uuid("post_id"),
  comment_id: uuid("comment_id"),
  message_id: uuid("message_id"),
  report_type: reportTypeEnum("report_type").notNull(),
  description: text("description"),
  evidence: jsonb("evidence"),
  status: reportStatusEnum("status").default("pending"),
  reviewed_by_admin: uuid("reviewed_by_admin"),
  admin_notes: text("admin_notes"),
  action_taken: actionTakenEnum("action_taken").default("none"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type UserReport = InferModel<typeof user_reports>;
export type NewUserReport = InferModel<typeof user_reports, "insert">;

/**
 * SYSTEM_LOGS
 */
export const system_logs = pgTable("system_logs", {
  log_id: uuid("log_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id"),
  action_type: actionTypeEnum("action_type").notNull(),
  module: moduleEnum("module").notNull(),
  description: text("description"),
  metadata: jsonb("metadata"),
  ip_address: varchar("ip_address", { length: 64 }),
  user_agent: varchar("user_agent", { length: 1000 }),
  log_level: logLevelEnum("log_level").default("info"),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export type SystemLog = InferModel<typeof system_logs>;
export type NewSystemLog = InferModel<typeof system_logs, "insert">;

/**
 * ANNOUNCEMENTS
 */
export const announcements = pgTable("announcements", {
  announcement_id: uuid("announcement_id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 512 }).notNull(),
  content: text("content").notNull(),
  created_by: uuid("created_by").notNull(),
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type Announcement = InferModel<typeof announcements>;
export type NewAnnouncement = InferModel<typeof announcements, "insert">;

/**
 * WEATHER_DATA
 */
export const weather_data = pgTable("weather_data", {
  weather_id: uuid("weather_id").primaryKey().defaultRandom(),
  location_id: uuid("location_id").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull(),
  temperature_celsius: doublePrecision("temperature_celsius"),
  humidity_percentage: doublePrecision("humidity_percentage"),
  rainfall_mm: doublePrecision("rainfall_mm"),
  conditions: varchar("conditions", { length: 256 }),
  forecast_data: jsonb("forecast_data"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type WeatherData = InferModel<typeof weather_data>;
export type NewWeatherData = InferModel<typeof weather_data, "insert">;

/**
 * MEMBERSHIP_REQUESTS
 */
export const membership_requests = pgTable("membership_requests", {
  request_id: uuid("request_id").primaryKey().defaultRandom(),
  chatroom_id: uuid("chatroom_id").notNull(),
  user_id: uuid("user_id").notNull(),
  requested_by: uuid("requested_by"), // null if user self-requested
  message: text("message"),
  status: membershipRequestStatusEnum("status").default("pending"),
  reviewed_by: uuid("reviewed_by"),
  reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  response_message: text("response_message"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type MembershipRequest = InferModel<typeof membership_requests>;
export type NewMembershipRequest = InferModel<typeof membership_requests, "insert">;

/**
 * MEMBERSHIP_LOGS
 */
export const membership_logs = pgTable("membership_logs", {
  log_id: uuid("log_id").primaryKey().defaultRandom(),
  chatroom_id: uuid("chatroom_id").notNull(),
  user_id: uuid("user_id").notNull(),
  action: membershipActionEnum("action").notNull(),
  performed_by: uuid("performed_by"), // who performed the action (null for self-actions)
  old_value: jsonb("old_value"), // previous state (role, etc.)
  new_value: jsonb("new_value"), // new state (role, etc.)
  reason: text("reason"), // optional reason for the action
  metadata: jsonb("metadata"), // additional context
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type MembershipLog = InferModel<typeof membership_logs>;
export type NewMembershipLog = InferModel<typeof membership_logs, "insert">;

/**
 * CHATROOM_INVITATIONS
 */
export const chatroom_invitations = pgTable("chatroom_invitations", {
  invitation_id: uuid("invitation_id").primaryKey().defaultRandom(),
  chatroom_id: uuid("chatroom_id").notNull(),
  invited_user_id: uuid("invited_user_id"),
  invited_email: varchar("invited_email", { length: 320 }),
  invitation_code: varchar("invitation_code", { length: 64 }).notNull().unique(),
  invited_by: uuid("invited_by").notNull(),
  expires_at: timestamp("expires_at", { withTimezone: true }),
  status: invitationStatusEnum("status").default("pending"),
  accepted_at: timestamp("accepted_at", { withTimezone: true }),
  message: text("message"),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export type ChatroomInvitation = InferModel<typeof chatroom_invitations>;
export type NewChatroomInvitation = InferModel<typeof chatroom_invitations, "insert">;

/**
 * NOTIFICATIONS
 */
export const notifications = pgTable("notifications", {
  notification_id: uuid("notification_id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull(),
  type: notificationTypeEnum("type").notNull(),
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  related_chatroom_id: uuid("related_chatroom_id"),
  related_user_id: uuid("related_user_id"),
  related_message_id: uuid("related_message_id"),
  metadata: jsonb("metadata"),
  is_read: boolean("is_read").default(false),
  read_at: timestamp("read_at", { withTimezone: true }),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export type Notification = InferModel<typeof notifications>;
export type NewNotification = InferModel<typeof notifications, "insert">;

/**
 * RELATIONS
 *
 * We add relations for main entities so Drizzle's `relations()` helper
 * can be used by service code. This is verbose but helps type-safety.
 */

/* Users relations */
export const usersRelations = relations(users, ({ many }) => ({
  // user -> courses created
  courses_created: many(courses),
  // user -> forum posts
  forum_posts: many(forum_posts),
  // user -> comments
  comments: many(comments),
  // user -> course_enrollments
  enrollments: many(course_enrollments),
  // user -> course_ratings
  ratings: many(course_ratings),
  // user -> system logs
  system_logs: many(system_logs),
}));

/* Locations relations */
export const locationsRelations = relations(locations, ({ many }) => ({
  users: many(users),
  weather: many(weather_data),
}));

/* Courses relations */
export const coursesRelations = relations(courses, ({ many, one }) => ({
  creator: one(users, { fields: [courses.creator_id], references: [users.user_id] }),
  lessons: many(lessons),
  enrollments: many(course_enrollments),
  ratings: many(course_ratings),
}));

/* Lessons relations */
export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  course: one(courses, { fields: [lessons.course_id], references: [courses.course_id] }),
  creator: one(users, { fields: [lessons.creator_id], references: [users.user_id] }),
  media: many(lesson_media),
  quizzes: many(quizzes),
  progress: many(lesson_progress),
}));

/* Course enrollments relations */
export const courseEnrollmentsRelations = relations(course_enrollments, ({ one, many }) => ({
  user: one(users, { fields: [course_enrollments.user_id], references: [users.user_id] }),
  course: one(courses, { fields: [course_enrollments.course_id], references: [courses.course_id] }),
  lesson_progress: many(lesson_progress),
  quiz_attempts: many(quiz_attempts),
  certificates: many(course_certificates),
}));

/* Lesson progress relations */
export const lessonProgressRelations = relations(lesson_progress, ({ one }) => ({
  enrollment: one(course_enrollments, { fields: [lesson_progress.enrollment_id], references: [course_enrollments.enrollment_id] }),
  lesson: one(lessons, { fields: [lesson_progress.lesson_id], references: [lessons.lesson_id] }),
}));

/* Course certificates relations */
export const courseCertificatesRelations = relations(course_certificates, ({ one }) => ({
  enrollment: one(course_enrollments, { fields: [course_certificates.enrollment_id], references: [course_enrollments.enrollment_id] }),
  issued_by: one(users, { fields: [course_certificates.issued_by], references: [users.user_id] }),
}));

/* Lesson media relations */
export const lessonMediaRelations = relations(lesson_media, ({ one }) => ({
  lesson: one(lessons, { fields: [lesson_media.lesson_id], references: [lessons.lesson_id] }),
}));

/* Quizzes relations */
export const quizzesRelations = relations(quizzes, ({ one, many }) => ({
  lesson: one(lessons, { fields: [quizzes.lesson_id], references: [lessons.lesson_id] }),
  questions: many(quiz_questions),
  attempts: many(quiz_attempts),
}));

/* Quiz questions relations */
export const quizQuestionsRelations = relations(quiz_questions, ({ one, many }) => ({
  quiz: one(quizzes, { fields: [quiz_questions.quiz_id], references: [quizzes.quiz_id] }),
  options: many(question_options),
  answers: many(quiz_answers),
}));

/* Question options relations */
export const questionOptionsRelations = relations(question_options, ({ one }) => ({
  question: one(quiz_questions, { fields: [question_options.question_id], references: [quiz_questions.question_id] }),
}));

/* Quiz attempts relations */
export const quizAttemptsRelations = relations(quiz_attempts, ({ one, many }) => ({
  enrollment: one(course_enrollments, { fields: [quiz_attempts.enrollment_id], references: [course_enrollments.enrollment_id] }),
  quiz: one(quizzes, { fields: [quiz_attempts.quiz_id], references: [quizzes.quiz_id] }),
  answers: many(quiz_answers),
}));

/* Quiz answers relations */
export const quizAnswersRelations = relations(quiz_answers, ({ one }) => ({
  attempt: one(quiz_attempts, { fields: [quiz_answers.attempt_id], references: [quiz_attempts.attempt_id] }),
  question: one(quiz_questions, { fields: [quiz_answers.question_id], references: [quiz_questions.question_id] }),
}));

/* Forums & posts relations */
export const forumsRelations = relations(forums, ({ many }) => ({
  posts: many(forum_posts),
}));

export const forumPostsRelations = relations(forum_posts, ({ one, many }) => ({
  forum: one(forums, { fields: [forum_posts.forum_id], references: [forums.forum_id] }),
  author: one(users, { fields: [forum_posts.user_id], references: [users.user_id] }),
  comments: many(comments),
  reactions: many(post_reactions),
  read_status: many(post_read_status),
}));

/* Comments relations */
export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(forum_posts, { fields: [comments.post_id], references: [forum_posts.post_id] }),
  author: one(users, { fields: [comments.user_id], references: [users.user_id] }),
  parent: one(comments, { fields: [comments.parent_comment_id], references: [comments.comment_id] }),
  replies: many(comments),
  reactions: many(post_reactions),
}));

/* Post reactions relations */
export const postReactionsRelations = relations(post_reactions, ({ one }) => ({
  user: one(users, { fields: [post_reactions.user_id], references: [users.user_id] }),
  post: one(forum_posts, { fields: [post_reactions.post_id], references: [forum_posts.post_id] }),
  comment: one(comments, { fields: [post_reactions.comment_id], references: [comments.comment_id] }),
}));

/* Post read status relations */
export const postReadStatusRelations = relations(post_read_status, ({ one }) => ({
  post: one(forum_posts, { fields: [post_read_status.post_id], references: [forum_posts.post_id] }),
  user: one(users, { fields: [post_read_status.user_id], references: [users.user_id] }),
}));

/* Chatroom relations */
export const chatroomsRelations = relations(chatrooms, ({ one, many }) => ({
  creator: one(users, { fields: [chatrooms.created_by], references: [users.user_id] }),
  members: many(chatroom_members),
  messages: many(chat_messages),
  membershipRequests: many(membership_requests),
  membershipLogs: many(membership_logs),
  invitations: many(chatroom_invitations),
}));

/* Chatroom members relations */
export const chatroomMembersRelations = relations(chatroom_members, ({ one }) => ({
  chatroom: one(chatrooms, { fields: [chatroom_members.chatroom_id], references: [chatrooms.chatroom_id] }),
  user: one(users, { fields: [chatroom_members.user_id], references: [users.user_id] }),
  invitedBy: one(users, { fields: [chatroom_members.invited_by], references: [users.user_id] }),
}));

/* Chat messages relations */
export const chatMessagesRelations = relations(chat_messages, ({ one, many }) => ({
  chatroom: one(chatrooms, { fields: [chat_messages.chatroom_id], references: [chatrooms.chatroom_id] }),
  author: one(users, { fields: [chat_messages.user_id], references: [users.user_id] }),
  reply_to: one(chat_messages, { fields: [chat_messages.reply_to_message_id], references: [chat_messages.message_id] }),
  attachments: many(message_attachments),
  reactions: many(message_reactions),
  read_status: many(message_read_status),
}));

/* Message attachments relations */
export const messageAttachmentsRelations = relations(message_attachments, ({ one }) => ({
  message: one(chat_messages, { fields: [message_attachments.message_id], references: [chat_messages.message_id] }),
}));

/* Message read status relations */
export const messageReadStatusRelations = relations(message_read_status, ({ one }) => ({
  message: one(chat_messages, { fields: [message_read_status.message_id], references: [chat_messages.message_id] }),
  user: one(users, { fields: [message_read_status.user_id], references: [users.user_id] }),
}));

/* Message reactions relations */
export const messageReactionsRelations = relations(message_reactions, ({ one }) => ({
  message: one(chat_messages, { fields: [message_reactions.message_id], references: [chat_messages.message_id] }),
  user: one(users, { fields: [message_reactions.user_id], references: [users.user_id] }),
}));

/* Membership requests relations */
export const membershipRequestsRelations = relations(membership_requests, ({ one }) => ({
  chatroom: one(chatrooms, { fields: [membership_requests.chatroom_id], references: [chatrooms.chatroom_id] }),
  user: one(users, { fields: [membership_requests.user_id], references: [users.user_id] }),
  requestedBy: one(users, { fields: [membership_requests.requested_by], references: [users.user_id] }),
  reviewedBy: one(users, { fields: [membership_requests.reviewed_by], references: [users.user_id] }),
}));

/* Membership logs relations */
export const membershipLogsRelations = relations(membership_logs, ({ one }) => ({
  chatroom: one(chatrooms, { fields: [membership_logs.chatroom_id], references: [chatrooms.chatroom_id] }),
  user: one(users, { fields: [membership_logs.user_id], references: [users.user_id] }),
  performedBy: one(users, { fields: [membership_logs.performed_by], references: [users.user_id] }),
}));

/* Chatroom invitations relations */
export const chatroomInvitationsRelations = relations(chatroom_invitations, ({ one }) => ({
  chatroom: one(chatrooms, { fields: [chatroom_invitations.chatroom_id], references: [chatrooms.chatroom_id] }),
  invitedUser: one(users, { fields: [chatroom_invitations.invited_user_id], references: [users.user_id] }),
  invitedBy: one(users, { fields: [chatroom_invitations.invited_by], references: [users.user_id] }),
}));

/* Notifications relations */
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.user_id], references: [users.user_id] }),
  relatedChatroom: one(chatrooms, { fields: [notifications.related_chatroom_id], references: [chatrooms.chatroom_id] }),
  relatedUser: one(users, { fields: [notifications.related_user_id], references: [users.user_id] }),
  relatedMessage: one(chat_messages, { fields: [notifications.related_message_id], references: [chat_messages.message_id] }),
}));

/* User reports relations */
export const userReportsRelations = relations(user_reports, ({ one }) => ({
  reporter: one(users, { fields: [user_reports.reporter_user_id], references: [users.user_id] }),
  reported: one(users, { fields: [user_reports.reported_user_id], references: [users.user_id] }),
  reviewed_by: one(users, { fields: [user_reports.reviewed_by_admin], references: [users.user_id] }),
  post: one(forum_posts, { fields: [user_reports.post_id], references: [forum_posts.post_id] }),
  comment: one(comments, { fields: [user_reports.comment_id], references: [comments.comment_id] }),
  message: one(chat_messages, { fields: [user_reports.message_id], references: [chat_messages.message_id] }),
}));

/* System logs relations */
export const systemLogsRelations = relations(system_logs, ({ one }) => ({
  user: one(users, { fields: [system_logs.user_id], references: [users.user_id] }),
}));

/* Announcements relations */
export const announcementsRelations = relations(announcements, ({ one }) => ({
  creator: one(users, { fields: [announcements.created_by], references: [users.user_id] }),
}));

/* Weather data relations */
export const weatherDataRelations = relations(weather_data, ({ one }) => ({
  location: one(locations, { fields: [weather_data.location_id], references: [locations.location_id] }),
}));

/**
 * Export all tables so Drizzle-Kit can import them
 */
export {
  // tables
  users as usersTable,
  locations as locationsTable,
  courses as coursesTable,
  course_ratings as courseRatingsTable,
  lessons as lessonsTable,
  course_enrollments as courseEnrollmentsTable,
  lesson_progress as lessonProgressTable,
  course_certificates as courseCertificatesTable,
  lesson_media as lessonMediaTable,
  quizzes as quizzesTable,
  quiz_questions as quizQuestionsTable,
  question_options as questionOptionsTable,
  quiz_attempts as quizAttemptsTable,
  quiz_answers as quizAnswersTable,
  forums as forumsTable,
  forum_posts as forumPostsTable,
  comments as commentsTable,
  post_reactions as postReactionsTable,
  post_read_status as postReadStatusTable,
  chatrooms as chatroomsTable,
  chatroom_members as chatroomMembersTable,
  chat_messages as chatMessagesTable,
  message_attachments as messageAttachmentsTable,
  message_read_status as messageReadStatusTable,
  message_reactions as messageReactionsTable,
  membership_requests as membershipRequestsTable,
  membership_logs as membershipLogsTable,
  chatroom_invitations as chatroomInvitationsTable,
  notifications as notificationsTable,
  user_reports as userReportsTable,
  system_logs as systemLogsTable,
  announcements as announcementsTable,
  weather_data as weatherDataTable,
  // enums
  rolesEnum as roles_enum,
  courseStatusEnum as course_status_enum,
  lessonStatusEnum as lesson_status_enum,
  enrollmentStatusEnum as enrollment_status_enum,
  lessonProgressStatusEnum as lesson_progress_status_enum,
  mediaTypeEnum as media_type_enum,
  quizQuestionTypeEnum as quiz_question_type_enum,
  quizAttemptStatusEnum as quiz_attempt_status_enum,
  forumStatusEnum as forum_status_enum,
  commentStatusEnum as comment_status_enum,
  reactionTypeEnum as reaction_type_enum,
  chatroomTypeEnum as chatroom_type_enum,
  chatroomStatusEnum as chatroom_status_enum,
  chatMemberRoleEnum as chat_member_role_enum,
  chatMemberStatusEnum as chat_member_status_enum,
  messageTypeEnum as message_type_enum,
  attachmentFileTypeEnum as attachment_file_type_enum,
  reportTypeEnum as report_type_enum,
  reportStatusEnum as report_status_enum,
  actionTakenEnum as action_taken_enum,
  actionTypeEnum as action_type_enum,
  moduleEnum as module_enum,
  logLevelEnum as log_level_enum,
  membershipRequestStatusEnum as membership_request_status_enum,
  invitationStatusEnum as invitation_status_enum,
  membershipActionEnum as membership_action_enum,
  notificationTypeEnum as notification_type_enum,
};
