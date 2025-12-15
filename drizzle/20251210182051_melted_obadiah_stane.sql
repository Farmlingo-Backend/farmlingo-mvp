CREATE TYPE "public"."action_taken" AS ENUM('none', 'warning', 'content_removed', 'user_suspended', 'user_banned');--> statement-breakpoint
CREATE TYPE "public"."action_type" AS ENUM('login', 'logout', 'content_upload', 'user_delete', 'api_call', 'admin_action');--> statement-breakpoint
CREATE TYPE "public"."attachment_file_type" AS ENUM('image', 'video', 'audio', 'document', 'pdf');--> statement-breakpoint
CREATE TYPE "public"."chat_member_role" AS ENUM('admin', 'moderator', 'member');--> statement-breakpoint
CREATE TYPE "public"."chat_member_status" AS ENUM('active', 'left', 'removed', 'banned');--> statement-breakpoint
CREATE TYPE "public"."chatroom_status" AS ENUM('active', 'archived');--> statement-breakpoint
CREATE TYPE "public"."chatroom_type" AS ENUM('direct', 'group', 'topic_based');--> statement-breakpoint
CREATE TYPE "public"."comment_status" AS ENUM('active', 'deleted', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."course_status" AS ENUM('draft', 'unpublished', 'published');--> statement-breakpoint
CREATE TYPE "public"."enrollment_status" AS ENUM('not_started', 'in_progress', 'completed', 'dropped');--> statement-breakpoint
CREATE TYPE "public"."forum_status" AS ENUM('active', 'deleted', 'flagged', 'archived');--> statement-breakpoint
CREATE TYPE "public"."lesson_progress_status" AS ENUM('not_started', 'in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."lesson_status" AS ENUM('draft', 'published');--> statement-breakpoint
CREATE TYPE "public"."log_level" AS ENUM('info', 'warning', 'error', 'critical');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('video', 'pdf', 'image', 'audio', 'document');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'image', 'video', 'audio', 'file', 'system');--> statement-breakpoint
CREATE TYPE "public"."module_type" AS ENUM('auth', 'forum', 'chat', 'course', 'admin', 'system');--> statement-breakpoint
CREATE TYPE "public"."quiz_attempt_status" AS ENUM('in_progress', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."question_type" AS ENUM('multiple_choice', 'true_false', 'multiple_answer');--> statement-breakpoint
CREATE TYPE "public"."reaction_type" AS ENUM('like', 'dislike');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'in_review', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('spam', 'harassment', 'inappropriate', 'misinformation');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('student', 'farmer', 'admin', 'super_admin');--> statement-breakpoint
CREATE TABLE "chat_messages" (
	"message_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatroom_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"reply_to_message_id" uuid,
	"content" text,
	"message_type" "message_type" DEFAULT 'text',
	"metadata" jsonb,
	"is_edited" boolean DEFAULT false,
	"is_deleted" boolean DEFAULT false,
	"deleted_reason" text,
	"reaction_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "chatroom_members" (
	"member_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatroom_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "chat_member_role" DEFAULT 'member',
	"permissions" jsonb,
	"joined_at" timestamp with time zone DEFAULT now(),
	"last_read_at" timestamp with time zone,
	"unread_count" integer DEFAULT 0,
	"is_muted" boolean DEFAULT false,
	"is_pinned" boolean DEFAULT false,
	"status" "chat_member_status" DEFAULT 'active',
	"left_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "chatrooms" (
	"chatroom_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"chatroom_type" "chatroom_type" NOT NULL,
	"name" varchar(256),
	"description" text,
	"avatar_url" varchar(1000),
	"created_by" uuid,
	"member_count" integer DEFAULT 0,
	"last_message_id" uuid,
	"last_activity" timestamp with time zone,
	"settings" jsonb,
	"status" "chatroom_status" DEFAULT 'active',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"comment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"parent_comment_id" uuid,
	"content" text NOT NULL,
	"like_count" integer DEFAULT 0,
	"dislike_count" integer DEFAULT 0,
	"is_solution" boolean DEFAULT false,
	"is_edited" boolean DEFAULT false,
	"status" "comment_status" DEFAULT 'active',
	"delete_reason" text,
	"deleted_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "course_certificates" (
	"certificate_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"certificate_url" varchar(1000),
	"certificate_code" varchar(128) NOT NULL,
	"issued_by" uuid,
	"issued_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"enrollment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"course_id" uuid NOT NULL,
	"enrollment_status" "enrollment_status" DEFAULT 'not_started',
	"enrolled_at" timestamp with time zone DEFAULT now(),
	"completed_at" timestamp with time zone,
	"progress_percentage" double precision DEFAULT 0,
	"preferences" jsonb
);
--> statement-breakpoint
CREATE TABLE "course_ratings" (
	"rating_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"rating_value" integer NOT NULL,
	"review_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"course_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(512) NOT NULL,
	"description" text,
	"category" varchar(128),
	"language" varchar(16),
	"thumbnail_url" varchar(1000),
	"total_lessons" integer DEFAULT 0,
	"total_duration_minutes" integer DEFAULT 0,
	"average_rating" double precision DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"status" "course_status" DEFAULT 'draft',
	"creator_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "forum_posts" (
	"post_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"forum_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" varchar(512),
	"content" text,
	"tags" jsonb,
	"view_count" integer DEFAULT 0,
	"like_count" integer DEFAULT 0,
	"dislike_count" integer DEFAULT 0,
	"comment_count" integer DEFAULT 0,
	"is_solved" boolean DEFAULT false,
	"is_pinned" boolean DEFAULT false,
	"is_locked" boolean DEFAULT false,
	"status" "forum_status" DEFAULT 'active',
	"delete_reason" text,
	"deleted_by" uuid,
	"last_activity" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "forums" (
	"forum_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) NOT NULL,
	"description" text,
	"slug" varchar(256) NOT NULL,
	"category" varchar(128),
	"post_count" integer DEFAULT 0,
	"member_count" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"display_order" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lesson_media" (
	"media_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"media_type" "media_type" NOT NULL,
	"file_url" varchar(1000),
	"thumbnail_url" varchar(1000),
	"file_label" varchar(512),
	"file_size_bytes" integer DEFAULT 0,
	"duration_seconds" integer DEFAULT 0,
	"mime_type" varchar(128),
	"order_number" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lesson_progress" (
	"progress_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"lesson_id" uuid NOT NULL,
	"status" "lesson_progress_status" DEFAULT 'not_started',
	"progress_percentage" double precision DEFAULT 0,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"time_spent_minutes" integer DEFAULT 0,
	"metadata" jsonb,
	"last_accessed" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "lessons" (
	"lesson_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"title" varchar(512) NOT NULL,
	"description" text,
	"category" varchar(128),
	"duration_minutes" integer DEFAULT 0,
	"order_number" integer DEFAULT 0,
	"is_mandatory" boolean DEFAULT false,
	"metadata" jsonb,
	"status" "lesson_status" DEFAULT 'draft',
	"creator_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"location_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_name" varchar(256),
	"country" varchar(128),
	"country_code" varchar(8),
	"latitude" double precision,
	"longitude" double precision,
	"timezone" varchar(64),
	"location_details" jsonb,
	"user_count" integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE "message_attachments" (
	"attachment_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"file_type" "attachment_file_type" NOT NULL,
	"file_url" varchar(1000) NOT NULL,
	"thumbnail_url" varchar(1000),
	"file_name" varchar(512),
	"file_size_bytes" integer DEFAULT 0,
	"mime_type" varchar(128),
	"duration_seconds" integer DEFAULT 0,
	"uploaded_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_reactions" (
	"reaction_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"emoji" varchar(64),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_read_status" (
	"read_status_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone,
	"delivered_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"reaction_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"post_id" uuid,
	"comment_id" uuid,
	"reaction_type" "reaction_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_read_status" (
	"read_status_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "question_options" (
	"option_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"option_text" text NOT NULL,
	"is_correct" boolean DEFAULT false,
	"order_number" integer DEFAULT 0,
	"feedback" text
);
--> statement-breakpoint
CREATE TABLE "quiz_answers" (
	"answer_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"selected_options" jsonb,
	"is_correct" boolean DEFAULT false,
	"points_earned" integer DEFAULT 0,
	"time_taken_seconds" integer DEFAULT 0,
	"answered_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"attempt_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"enrollment_id" uuid NOT NULL,
	"quiz_id" uuid NOT NULL,
	"score_percentage" double precision DEFAULT 0,
	"score_points" integer DEFAULT 0,
	"total_points" integer DEFAULT 0,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"attempt_number" integer DEFAULT 1,
	"time_taken_seconds" integer DEFAULT 0,
	"status" "quiz_attempt_status" DEFAULT 'in_progress',
	"passed" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"question_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"quiz_id" uuid NOT NULL,
	"question_text" text NOT NULL,
	"question_type" "question_type" NOT NULL,
	"points" integer DEFAULT 0,
	"order_number" integer DEFAULT 0,
	"explanation" text,
	"media" jsonb,
	"external_resources" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"quiz_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"title" varchar(512),
	"description" text,
	"passing_score_percentage" double precision DEFAULT 0,
	"time_limit_minutes" integer DEFAULT 0,
	"max_attempts" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "system_logs" (
	"log_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"action_type" "action_type" NOT NULL,
	"module" "module_type" NOT NULL,
	"description" text,
	"metadata" jsonb,
	"ip_address" varchar(64),
	"user_agent" varchar(1000),
	"log_level" "log_level" DEFAULT 'info',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_reports" (
	"report_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_user_id" uuid NOT NULL,
	"reported_user_id" uuid,
	"post_id" uuid,
	"comment_id" uuid,
	"message_id" uuid,
	"report_type" "report_type" NOT NULL,
	"description" text,
	"evidence" jsonb,
	"status" "report_status" DEFAULT 'pending',
	"reviewed_by_admin" uuid,
	"admin_notes" text,
	"action_taken" "action_taken" DEFAULT 'none',
	"created_at" timestamp with time zone DEFAULT now(),
	"reviewed_at" timestamp with time zone,
	"updated_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"user_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_user_id" varchar(128),
	"email" varchar(320) NOT NULL,
	"first_name" varchar(128),
	"last_name" varchar(128),
	"image_url" varchar(1000),
	"password_hash" varchar(72),
	"role" "roles" DEFAULT 'student' NOT NULL,
	"location_id" uuid,
	"preferences" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"last_login" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "users_clerk_user_id_unique" UNIQUE("clerk_user_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "weather_data" (
	"weather_id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"timestamp" timestamp with time zone NOT NULL,
	"temperature_celsius" double precision,
	"humidity_percentage" double precision,
	"rainfall_mm" double precision,
	"conditions" varchar(256),
	"forecast_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now()
);
