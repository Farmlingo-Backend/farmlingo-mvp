"use strict";
/**
 * Reusable OpenAPI component schemas for Farmlingo API
 * Exported to be used in swagger.ts and route JSDoc blocks
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerComponents = void 0;
exports.swaggerComponents = {
    schemas: {
        // === USERS ===
        User: {
            type: 'object',
            description: 'User profile with Clerk authentication integration',
            properties: {
                user_id: {
                    type: 'string',
                    format: 'uuid',
                    description: 'Unique user identifier (UUID)',
                    example: '123e4567-e89b-12d3-a456-426614174000'
                },
                clerk_user_id: {
                    type: 'string',
                    description: 'Clerk authentication user ID',
                    example: 'user_2abcdefghijklmnop',
                    nullable: true
                },
                email: {
                    type: 'string',
                    format: 'email',
                    description: 'User email address (unique)',
                    example: 'john.doe@example.com'
                },
                first_name: {
                    type: 'string',
                    description: 'User first name',
                    example: 'John',
                    nullable: true
                },
                last_name: {
                    type: 'string',
                    description: 'User last name',
                    example: 'Doe',
                    nullable: true
                },
                image_url: {
                    type: 'string',
                    format: 'uri',
                    description: 'User profile image URL from Clerk',
                    example: 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18yYWJjM2RlZiJ9',
                    nullable: true
                },
                created_at: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Account creation timestamp',
                    example: '2025-12-11T00:00:00Z'
                },
                updated_at: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Last profile update timestamp',
                    example: '2025-12-11T03:10:00Z',
                    nullable: true
                },
                last_login: {
                    type: 'string',
                    format: 'date-time',
                    description: 'Last successful login timestamp',
                    example: '2025-12-12T22:30:00Z',
                    nullable: true
                },
                is_active: {
                    type: 'boolean',
                    description: 'Account active status',
                    example: true
                }
            }
        },
        NewUser: {
            type: 'object',
            required: ['email'],
            description: 'Schema for creating a new user',
            properties: {
                clerk_user_id: {
                    type: 'string',
                    description: 'Clerk authentication user ID',
                    example: 'user_2abcdefghijklmnop',
                    nullable: true
                },
                email: {
                    type: 'string',
                    format: 'email',
                    description: 'User email address (must be unique)',
                    example: 'john.doe@example.com'
                },
                first_name: {
                    type: 'string',
                    description: 'User first name',
                    example: 'John',
                    nullable: true
                },
                last_name: {
                    type: 'string',
                    description: 'User last name',
                    example: 'Doe',
                    nullable: true
                },
                image_url: {
                    type: 'string',
                    format: 'uri',
                    description: 'User profile image URL',
                    example: 'https://img.clerk.com/profile.jpg',
                    nullable: true
                }
            }
        },
        UserLoginRequest: {
            type: 'object',
            properties: {
                clerk_user_id: { type: 'string', example: 'user_36g1OXgY7VKtg' },
                email: { type: 'string', format: 'email', example: 'bogikam587@alexida.com' }
            },
            description: 'Provide either clerk_user_id or email to log in.'
        },
        AuthTokenResponse: {
            type: 'object',
            properties: {
                access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                token_type: { type: 'string', example: 'Bearer' },
                user: { $ref: '#/components/schemas/User' }
            }
        },
        UserDashboardResponse: {
            type: 'object',
            properties: {
                user: { $ref: '#/components/schemas/User' },
                dashboard: {
                    type: 'object',
                    properties: {
                        message: { type: 'string', example: 'User dashboard data not yet implemented' }
                    }
                }
            }
        },
        // === LOCATIONS ===
        Location: {
            type: 'object',
            properties: {
                location_id: { type: 'string', format: 'uuid' },
                location_name: { type: 'string', example: 'Nairobi' },
                country: { type: 'string', example: 'Kenya' },
                country_code: { type: 'string', example: 'KE' },
                latitude: { type: 'number', format: 'double', example: -1.2921 },
                longitude: { type: 'number', format: 'double', example: 36.8219 },
                timezone: { type: 'string', example: 'Africa/Nairobi' },
                location_details: { type: 'object', nullable: true },
                user_count: { type: 'integer', example: 124 }
            }
        },
        // === COURSES ===
        Course: {
            type: 'object',
            properties: {
                course_id: { type: 'string', format: 'uuid' },
                title: { type: 'string', example: 'Introduction to Hydroponics' },
                description: { type: 'string', nullable: true },
                category: { type: 'string', example: 'hydroponics' },
                language: { type: 'string', example: 'en' },
                thumbnail_url: { type: 'string', nullable: true },
                total_lessons: { type: 'integer', example: 12 },
                total_duration_minutes: { type: 'integer', example: 480 },
                average_rating: { type: 'number', format: 'double', example: 4.6 },
                rating_count: { type: 'integer', example: 23 },
                status: {
                    type: 'string',
                    enum: ['draft', 'unpublished', 'published'],
                    example: 'published'
                },
                creator_id: { type: 'string', format: 'uuid' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time', nullable: true }
            }
        },
        NewCourse: {
            type: 'object',
            required: ['title', 'creator_id'],
            properties: {
                title: { type: 'string', example: 'Introduction to Hydroponics' },
                description: { type: 'string', nullable: true },
                category: { type: 'string', example: 'hydroponics' },
                language: { type: 'string', example: 'en' },
                thumbnail_url: { type: 'string', nullable: true },
                status: {
                    type: 'string',
                    enum: ['draft', 'unpublished', 'published'],
                    example: 'draft'
                },
                creator_id: { type: 'string', format: 'uuid' }
            }
        },
        // === LESSONS ===
        Lesson: {
            type: 'object',
            properties: {
                lesson_id: { type: 'string', format: 'uuid' },
                course_id: { type: 'string', format: 'uuid' },
                title: { type: 'string', example: 'Nutrient Solutions' },
                description: { type: 'string', nullable: true },
                category: { type: 'string', example: 'hydroponics' },
                duration_minutes: { type: 'integer', example: 40 },
                order_number: { type: 'integer', example: 3 },
                is_mandatory: { type: 'boolean', example: false },
                metadata: { type: 'object', nullable: true },
                status: {
                    type: 'string',
                    enum: ['draft', 'published'],
                    example: 'published'
                },
                creator_id: { type: 'string', format: 'uuid' },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time', nullable: true }
            }
        },
        NewLesson: {
            type: 'object',
            required: ['course_id', 'title', 'creator_id'],
            properties: {
                course_id: { type: 'string', format: 'uuid' },
                title: { type: 'string', example: 'Nutrient Solutions' },
                description: { type: 'string', nullable: true },
                category: { type: 'string', example: 'hydroponics' },
                duration_minutes: { type: 'integer', example: 40 },
                order_number: { type: 'integer', example: 3 },
                is_mandatory: { type: 'boolean', example: false },
                metadata: { type: 'object', nullable: true },
                status: {
                    type: 'string',
                    enum: ['draft', 'published'],
                    example: 'draft'
                },
                creator_id: { type: 'string', format: 'uuid' }
            }
        },
        // === COURSE ENROLLMENTS ===
        CourseEnrollment: {
            type: 'object',
            properties: {
                enrollment_id: { type: 'string', format: 'uuid' },
                user_id: { type: 'string', format: 'uuid' },
                course_id: { type: 'string', format: 'uuid' },
                enrollment_status: {
                    type: 'string',
                    enum: ['not_started', 'in_progress', 'completed', 'dropped'],
                    example: 'in_progress'
                },
                enrolled_at: { type: 'string', format: 'date-time' },
                completed_at: { type: 'string', format: 'date-time', nullable: true },
                progress_percentage: { type: 'number', format: 'double', example: 65.5 },
                preferences: { type: 'object', nullable: true }
            }
        },
        NewEnrollment: {
            type: 'object',
            required: ['user_id', 'course_id'],
            properties: {
                user_id: { type: 'string', format: 'uuid' },
                course_id: { type: 'string', format: 'uuid' },
                enrollment_status: {
                    type: 'string',
                    enum: ['not_started', 'in_progress', 'completed', 'dropped'],
                    example: 'not_started'
                },
                preferences: { type: 'object', nullable: true }
            }
        },
        // === FORUMS ===
        Forum: {
            type: 'object',
            properties: {
                forum_id: { type: 'string', format: 'uuid' },
                name: { type: 'string', example: 'General Discussion' },
                description: { type: 'string', nullable: true },
                slug: { type: 'string', example: 'general-discussion' },
                category: { type: 'string', example: 'general' },
                post_count: { type: 'integer', example: 42 },
                member_count: { type: 'integer', example: 128 },
                is_active: { type: 'boolean', example: true },
                display_order: { type: 'integer', example: 1 },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time', nullable: true }
            }
        },
        NewForum: {
            type: 'object',
            required: ['name', 'slug'],
            properties: {
                name: { type: 'string', example: 'General Discussion' },
                description: { type: 'string', nullable: true },
                slug: { type: 'string', example: 'general-discussion' },
                category: { type: 'string', example: 'general' },
                is_active: { type: 'boolean', example: true },
                display_order: { type: 'integer', example: 1 }
            }
        },
        // === FORUM POSTS ===
        ForumPost: {
            type: 'object',
            properties: {
                post_id: { type: 'string', format: 'uuid' },
                forum_id: { type: 'string', format: 'uuid' },
                user_id: { type: 'string', format: 'uuid' },
                title: { type: 'string', example: 'How to prevent root rot?' },
                content: { type: 'string', example: 'I noticed some of my plants have root rot...' },
                tags: { type: 'array', items: { type: 'string' }, nullable: true },
                view_count: { type: 'integer', example: 15 },
                like_count: { type: 'integer', example: 3 },
                dislike_count: { type: 'integer', example: 0 },
                comment_count: { type: 'integer', example: 5 },
                is_solved: { type: 'boolean', example: false },
                is_pinned: { type: 'boolean', example: false },
                is_locked: { type: 'boolean', example: false },
                status: {
                    type: 'string',
                    enum: ['active', 'deleted', 'flagged', 'archived'],
                    example: 'active'
                },
                delete_reason: { type: 'string', nullable: true },
                deleted_by: { type: 'string', format: 'uuid', nullable: true },
                last_activity: { type: 'string', format: 'date-time', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time', nullable: true },
                deleted_at: { type: 'string', format: 'date-time', nullable: true }
            }
        },
        NewForumPost: {
            type: 'object',
            required: ['forum_id', 'user_id', 'title', 'content'],
            properties: {
                forum_id: { type: 'string', format: 'uuid' },
                user_id: { type: 'string', format: 'uuid' },
                title: { type: 'string', example: 'How to prevent root rot?' },
                content: { type: 'string', example: 'I noticed some of my plants have root rot...' },
                tags: { type: 'array', items: { type: 'string' }, nullable: true }
            }
        },
        // === COMMENTS ===
        Comment: {
            type: 'object',
            properties: {
                comment_id: { type: 'string', format: 'uuid' },
                post_id: { type: 'string', format: 'uuid' },
                user_id: { type: 'string', format: 'uuid' },
                parent_comment_id: { type: 'string', format: 'uuid', nullable: true },
                content: { type: 'string', example: 'Try using hydrogen peroxide...' },
                like_count: { type: 'integer', example: 2 },
                dislike_count: { type: 'integer', example: 0 },
                is_solution: { type: 'boolean', example: false },
                is_edited: { type: 'boolean', example: false },
                status: {
                    type: 'string',
                    enum: ['active', 'deleted', 'flagged'],
                    example: 'active'
                },
                delete_reason: { type: 'string', nullable: true },
                deleted_by: { type: 'string', format: 'uuid', nullable: true },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time', nullable: true },
                deleted_at: { type: 'string', format: 'date-time', nullable: true }
            }
        },
        NewComment: {
            type: 'object',
            required: ['post_id', 'user_id', 'content'],
            properties: {
                post_id: { type: 'string', format: 'uuid' },
                user_id: { type: 'string', format: 'uuid' },
                parent_comment_id: { type: 'string', format: 'uuid', nullable: true },
                content: { type: 'string', example: 'Try using hydrogen peroxide...' }
            }
        },
        // === CHATROOMS ===
        Chatroom: {
            type: 'object',
            properties: {
                chatroom_id: { type: 'string', format: 'uuid' },
                chatroom_type: {
                    type: 'string',
                    enum: ['direct', 'group', 'topic_based'],
                    example: 'group'
                },
                name: { type: 'string', example: 'Hydroponics Enthusiasts' },
                description: { type: 'string', nullable: true },
                avatar_url: { type: 'string', nullable: true },
                created_by: { type: 'string', format: 'uuid' },
                member_count: { type: 'integer', example: 12 },
                last_message_id: { type: 'string', format: 'uuid', nullable: true },
                last_activity: { type: 'string', format: 'date-time', nullable: true },
                settings: { type: 'object', nullable: true },
                status: {
                    type: 'string',
                    enum: ['active', 'archived'],
                    example: 'active'
                },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time', nullable: true }
            }
        },
        NewChatroom: {
            type: 'object',
            required: ['chatroom_type', 'created_by'],
            properties: {
                chatroom_type: {
                    type: 'string',
                    enum: ['direct', 'group', 'topic_based'],
                    example: 'group'
                },
                name: { type: 'string', example: 'Hydroponics Enthusiasts' },
                description: { type: 'string', nullable: true },
                avatar_url: { type: 'string', nullable: true },
                created_by: { type: 'string', format: 'uuid' },
                settings: { type: 'object', nullable: true }
            }
        },
        // === CHAT MESSAGES ===
        ChatMessage: {
            type: 'object',
            properties: {
                message_id: { type: 'string', format: 'uuid' },
                chatroom_id: { type: 'string', format: 'uuid' },
                user_id: { type: 'string', format: 'uuid' },
                reply_to_message_id: { type: 'string', format: 'uuid', nullable: true },
                content: { type: 'string', example: 'Check out this new nutrient mix!' },
                message_type: {
                    type: 'string',
                    enum: ['text', 'image', 'video', 'audio', 'file', 'system'],
                    example: 'text'
                },
                metadata: { type: 'object', nullable: true },
                is_edited: { type: 'boolean', example: false },
                is_deleted: { type: 'boolean', example: false },
                deleted_reason: { type: 'string', nullable: true },
                reaction_count: { type: 'integer', example: 2 },
                created_at: { type: 'string', format: 'date-time' },
                updated_at: { type: 'string', format: 'date-time', nullable: true },
                deleted_at: { type: 'string', format: 'date-time', nullable: true }
            }
        },
        NewChatMessage: {
            type: 'object',
            required: ['chatroom_id', 'user_id', 'content'],
            properties: {
                chatroom_id: { type: 'string', format: 'uuid' },
                user_id: { type: 'string', format: 'uuid' },
                reply_to_message_id: { type: 'string', format: 'uuid', nullable: true },
                content: { type: 'string', example: 'Check out this new nutrient mix!' },
                message_type: {
                    type: 'string',
                    enum: ['text', 'image', 'video', 'audio', 'file', 'system'],
                    example: 'text'
                },
                metadata: { type: 'object', nullable: true }
            }
        },
        // === STANDARD ERROR SHAPE ===
        ApiError: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'Something went wrong' },
                error: { type: 'string', nullable: true }
            }
        },
        // === PAGINATION WRAPPER ===
        PaginatedResponse: {
            type: 'object',
            properties: {
                data: { type: 'array', items: { type: 'object' } },
                pagination: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer', example: 1 },
                        limit: { type: 'integer', example: 20 },
                        total: { type: 'integer', example: 124 },
                        totalPages: { type: 'integer', example: 7 }
                    }
                }
            }
        }
    }
};
