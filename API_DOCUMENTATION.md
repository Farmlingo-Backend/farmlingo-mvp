# Farmlingo MVP API Documentation

## Overview

This document provides comprehensive API documentation for the Farmlingo MVP backend, including all endpoints, request/response formats, and authentication requirements.

## Authentication

All endpoints require authentication via JWT tokens. The token should be included in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Base URL

```
http://localhost:3000/api/v1
```

## Roles and Permissions

### Super Admin
- **Email**: `root@farmlingo.com`
- **Role**: `super_admin`
- **Permissions**: Full access to all endpoints across all institutions

### Institution Admin
- **Role**: `institution_admin`
- **Permissions**: Access to their own institution's resources

### Instructor
- **Role**: `instructor`
- **Permissions**: Access to their own courses and materials

### Student/Farmer
- **Role**: `student` or `farmer`
- **Permissions**: Access to enrolled courses and public resources

## API Endpoints

### Authentication & Users

#### POST /auth/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "isActive": true
  },
  "message": "User registered successfully"
}
```

#### POST /auth/login
Authenticate a user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "jwt-token",
    "user": {
      "userId": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student"
    }
  }
}
```

#### GET /auth/me
Get current user information.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "student",
    "institutionId": "uuid",
    "isActive": true
  }
}
```

#### GET /users
Get all users (Super Admin only).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 100)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "student",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Institutions

#### POST /institutions
Create a new institution (Super Admin only).

**Request Body:**
```json
{
  "name": "University of Agriculture",
  "description": "A leading agricultural university",
  "logoUrl": "https://example.com/logo.png",
  "emailDomain": "uni-agri.edu"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "institutionId": "uuid",
    "name": "University of Agriculture",
    "description": "A leading agricultural university",
    "logoUrl": "https://example.com/logo.png",
    "emailDomain": "uni-agri.edu",
    "createdBy": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Institution created successfully"
}
```

#### GET /institutions
Get all institutions (Super Admin only).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "institutionId": "uuid",
      "name": "University of Agriculture",
      "description": "A leading agricultural university",
      "logoUrl": "https://example.com/logo.png",
      "emailDomain": "uni-agri.edu",
      "createdBy": "uuid",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /institutions/{institutionId}
Get institution by ID (Super Admin only).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "institutionId": "uuid",
    "name": "University of Agriculture",
    "description": "A leading agricultural university",
    "logoUrl": "https://example.com/logo.png",
    "emailDomain": "uni-agri.edu",
    "createdBy": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### PUT /institutions/{institutionId}
Update institution (Super Admin only).

**Request Body:**
```json
{
  "name": "Updated University Name",
  "description": "Updated description"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "institutionId": "uuid",
    "name": "Updated University Name",
    "description": "Updated description",
    "logoUrl": "https://example.com/logo.png",
    "emailDomain": "uni-agri.edu",
    "createdBy": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  },
  "message": "Institution updated successfully"
}
```

#### DELETE /institutions/{institutionId}
Delete institution (Super Admin only).

**Response (200):**
```json
{
  "success": true,
  "message": "Institution deleted successfully"
}
```

#### GET /institutions/{institutionId}/admins
Get institution admins (Super Admin only).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "uuid",
      "email": "admin@uni-agri.edu",
      "firstName": "Admin",
      "lastName": "User",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /institutions/{institutionId}/admins
Assign admin to institution (Super Admin only).

**Request Body:**
```json
{
  "userId": "uuid"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "user@uni-agri.edu",
    "firstName": "John",
    "lastName": "Doe",
    "role": "institution_admin",
    "institutionId": "uuid",
    "isActive": true
  },
  "message": "User promoted to institution admin successfully"
}
```

#### GET /institutions/{institutionId}/stats
Get institution statistics (Super Admin only).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "institution": {
      "institutionId": "uuid",
      "name": "University of Agriculture",
      "description": "A leading agricultural university",
      "logoUrl": "https://example.com/logo.png",
      "emailDomain": "uni-agri.edu",
      "createdBy": "uuid",
      "createdAt": "2023-01-01T00:00:00.000Z"
    },
    "userStats": {
      "totalUsers": 150,
      "students": 120,
      "farmers": 10,
      "instructors": 15,
      "admins": 5
    }
  }
}
```

### Instructors

#### POST /institutions/{institutionId}/instructors
Create instructor (Institution Admin only).

**Request Body:**
```json
{
  "email": "instructor@uni-agri.edu",
  "firstName": "Jane",
  "lastName": "Smith",
  "clerkUserId": "clerk-user-id"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "instructor@uni-agri.edu",
    "firstName": "Jane",
    "lastName": "Smith",
    "role": "instructor",
    "institutionId": "uuid",
    "isActive": true,
    "clerkUserId": "clerk-user-id"
  },
  "message": "Instructor created successfully"
}
```

#### GET /institutions/{institutionId}/instructors
Get instructors by institution (Institution Admin + Super Admin).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 100)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "userId": "uuid",
      "email": "instructor@uni-agri.edu",
      "firstName": "Jane",
      "lastName": "Smith",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /institutions/{institutionId}/instructors/{instructorId}
Get instructor by ID (Institution Admin + Super Admin).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "instructor@uni-agri.edu",
    "firstName": "Jane",
    "lastName": "Smith",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### PUT /institutions/{institutionId}/instructors/{instructorId}
Update instructor (Institution Admin + Super Admin).

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Updated",
  "isActive": true
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "instructor@uni-agri.edu",
    "firstName": "Jane",
    "lastName": "Updated",
    "role": "instructor",
    "institutionId": "uuid",
    "isActive": true
  },
  "message": "Instructor updated successfully"
}
```

#### DELETE /institutions/{institutionId}/instructors/{instructorId}
Delete instructor (Institution Admin + Super Admin).

**Response (200):**
```json
{
  "success": true,
  "message": "Instructor deactivated successfully"
}
```

#### GET /institutions/{institutionId}/instructors/{instructorId}/stats
Get instructor statistics (Institution Admin + Super Admin).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "instructor": {
      "userId": "uuid",
      "email": "instructor@uni-agri.edu",
      "name": "Jane Smith"
    },
    "courses": {
      "totalCourses": 5,
      "publishedCourses": 4,
      "draftCourses": 1
    },
    "enrollments": {
      "totalEnrollments": 150,
      "activeEnrollments": 120
    },
    "ratings": {
      "averageRating": 4.5,
      "totalRatings": 89
    }
  }
}
```

### Courses

#### POST /institutions/{institutionId}/courses
Create course (Institution Admin or Instructor).

**Request Body:**
```json
{
  "title": "Introduction to Sustainable Agriculture",
  "description": "Learn sustainable farming practices",
  "category": "Agriculture",
  "language": "en",
  "thumbnailUrl": "https://example.com/thumbnail.jpg",
  "status": "draft"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "title": "Introduction to Sustainable Agriculture",
    "description": "Learn sustainable farming practices",
    "category": "Agriculture",
    "language": "en",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "totalLessons": 0,
    "totalDurationMinutes": 0,
    "averageRating": 0,
    "ratingCount": 0,
    "status": "draft",
    "creatorId": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Course created successfully"
}
```

#### GET /institutions/{institutionId}/courses
Get courses by institution (All roles).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)
- `status` (string, optional): Filter by status (published, draft, archived)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "courseId": "uuid",
      "title": "Introduction to Sustainable Agriculture",
      "description": "Learn sustainable farming practices",
      "category": "Agriculture",
      "language": "en",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "totalLessons": 10,
      "totalDurationMinutes": 300,
      "averageRating": 4.5,
      "ratingCount": 120,
      "status": "published",
      "creatorId": "uuid",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /courses/{courseId}
Get course by ID (All roles).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "title": "Introduction to Sustainable Agriculture",
    "description": "Learn sustainable farming practices",
    "category": "Agriculture",
    "language": "en",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "totalLessons": 10,
    "totalDurationMinutes": 300,
    "averageRating": 4.5,
    "ratingCount": 120,
    "status": "published",
    "creatorId": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### PUT /courses/{courseId}
Update course (Institution Admin or Instructor).

**Request Body:**
```json
{
  "title": "Updated Course Title",
  "description": "Updated description",
  "status": "published"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "courseId": "uuid",
    "title": "Updated Course Title",
    "description": "Updated description",
    "category": "Agriculture",
    "language": "en",
    "thumbnailUrl": "https://example.com/thumbnail.jpg",
    "totalLessons": 10,
    "totalDurationMinutes": 300,
    "averageRating": 4.5,
    "ratingCount": 120,
    "status": "published",
    "creatorId": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  },
  "message": "Course updated successfully"
}
```

#### DELETE /courses/{courseId}
Delete course (Institution Admin only).

**Response (200):**
```json
{
  "success": true,
  "message": "Course deleted successfully"
}
```

#### POST /courses/{courseId}/enroll
Enroll in course (Student/Farmer).

**Response (201):**
```json
{
  "success": true,
  "data": {
    "enrollmentId": "uuid",
    "userId": "uuid",
    "courseId": "uuid",
    "enrollmentStatus": "not_started",
    "enrolledAt": "2023-01-01T00:00:00.000Z",
    "progressPercentage": 0
  },
  "message": "Successfully enrolled in course"
}
```

#### GET /users/me/courses
Get user's enrolled courses (All roles).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "enrollmentId": "uuid",
      "courseId": "uuid",
      "title": "Introduction to Sustainable Agriculture",
      "description": "Learn sustainable farming practices",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "enrollmentStatus": "in_progress",
      "progressPercentage": 45,
      "enrolledAt": "2023-01-01T00:00:00.000Z",
      "completedAt": null
    }
  ]
}
```

#### GET /courses/{courseId}/modules
Get course modules (All roles).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "moduleId": "uuid",
      "courseId": "uuid",
      "title": "Module 1: Basics",
      "description": "Introduction to basic concepts",
      "orderNumber": 1,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /modules/{moduleId}/lessons
Get module lessons (All roles).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "lessonId": "uuid",
      "moduleId": "uuid",
      "title": "Lesson 1: Introduction",
      "description": "Introduction to the topic",
      "durationMinutes": 30,
      "orderNumber": 1,
      "isMandatory": true,
      "status": "published",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /lessons/{lessonId}/videos
Get lesson videos (All roles).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "mediaId": "uuid",
      "lessonId": "uuid",
      "mediaType": "video",
      "fileUrl": "https://example.com/video.mp4",
      "thumbnailUrl": "https://example.com/thumbnail.jpg",
      "fileLabel": "Introduction Video",
      "fileSizeBytes": 50000000,
      "durationSeconds": 1800,
      "mimeType": "video/mp4",
      "orderNumber": 1,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /quizzes/{quizId}/questions
Get quiz questions (All roles).

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "questionId": "uuid",
      "quizId": "uuid",
      "questionText": "What is photosynthesis?",
      "questionType": "multiple_choice",
      "points": 10,
      "orderNumber": 1,
      "explanation": "Photosynthesis is the process by which plants convert light energy...",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /quizzes/{quizId}/start
Start quiz (Student/Farmer).

**Response (201):**
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "enrollmentId": "uuid",
    "quizId": "uuid",
    "scorePercentage": 0,
    "scorePoints": 0,
    "totalPoints": 100,
    "startedAt": "2023-01-01T00:00:00.000Z",
    "status": "in_progress"
  },
  "message": "Quiz started successfully"
}
```

#### POST /quizzes/{quizId}/submit
Submit quiz (Student/Farmer).

**Request Body:**
```json
{
  "answers": [
    {
      "questionId": "uuid",
      "selectedOptions": ["option1", "option2"]
    }
  ]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "scorePercentage": 85,
    "scorePoints": 85,
    "totalPoints": 100,
    "status": "completed",
    "passed": true,
    "completedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Quiz submitted successfully"
}
```

#### GET /quizzes/{quizId}/result
Get quiz result (Student/Farmer).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "attemptId": "uuid",
    "scorePercentage": 85,
    "scorePoints": 85,
    "totalPoints": 100,
    "status": "completed",
    "passed": true,
    "completedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### Materials

#### POST /institutions/{institutionId}/materials
Create learning material (Institution Admin or Instructor).

**Request Body:**
```json
{
  "title": "Agricultural Handbook PDF",
  "description": "Comprehensive guide to modern agriculture",
  "fileUrl": "https://example.com/handbook.pdf",
  "fileType": "pdf",
  "fileSize": 2500000,
  "fileName": "agricultural_handbook.pdf",
  "mimeType": "application/pdf",
  "courseId": "uuid",
  "accessLevel": "public",
  "status": "published"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "materialId": "uuid",
    "title": "Agricultural Handbook PDF",
    "description": "Comprehensive guide to modern agriculture",
    "fileUrl": "https://example.com/handbook.pdf",
    "fileType": "pdf",
    "fileSize": 2500000,
    "fileName": "agricultural_handbook.pdf",
    "mimeType": "application/pdf",
    "courseId": "uuid",
    "accessLevel": "public",
    "status": "published",
    "uploadedBy": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Learning material created successfully"
}
```

#### GET /institutions/{institutionId}/materials
Get materials by institution (All roles).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)
- `course` (string, optional): Filter by course ID
- `lesson` (string, optional): Filter by lesson ID
- `accessLevel` (string, optional): Filter by access level
- `type` (string, optional): Filter by file type

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "materialId": "uuid",
      "title": "Agricultural Handbook PDF",
      "description": "Comprehensive guide to modern agriculture",
      "fileUrl": "https://example.com/handbook.pdf",
      "fileType": "pdf",
      "fileSize": 2500000,
      "fileName": "agricultural_handbook.pdf",
      "mimeType": "application/pdf",
      "courseId": "uuid",
      "accessLevel": "public",
      "status": "published",
      "uploadedBy": "uuid",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /api/learning-materials/{materialId}
Get material by ID (All roles).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "materialId": "uuid",
    "title": "Agricultural Handbook PDF",
    "description": "Comprehensive guide to modern agriculture",
    "fileUrl": "https://example.com/handbook.pdf",
    "fileType": "pdf",
    "fileSize": 2500000,
    "fileName": "agricultural_handbook.pdf",
    "mimeType": "application/pdf",
    "courseId": "uuid",
    "accessLevel": "public",
    "status": "published",
    "uploadedBy": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### PUT /institutions/{institutionId}/materials/{materialId}
Update material (Institution Admin or Instructor).

**Request Body:**
```json
{
  "title": "Updated Material Title",
  "description": "Updated description",
  "status": "published"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "materialId": "uuid",
    "title": "Updated Material Title",
    "description": "Updated description",
    "fileUrl": "https://example.com/handbook.pdf",
    "fileType": "pdf",
    "fileSize": 2500000,
    "fileName": "agricultural_handbook.pdf",
    "mimeType": "application/pdf",
    "courseId": "uuid",
    "accessLevel": "public",
    "status": "published",
    "uploadedBy": "uuid",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  },
  "message": "Learning material updated successfully"
}
```

#### DELETE /institutions/{institutionId}/materials/{materialId}
Delete material (Institution Admin or Instructor).

**Response (200):**
```json
{
  "success": true,
  "message": "Learning material deleted successfully"
}
```

#### GET /api/files/{resourceId}/download
Download file (All roles).

**Response (200):**
File download stream

#### GET /api/videos/{resourceId}/url
Get video URL (All roles).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "videoUrl": "https://example.com/video.mp4",
    "expiresAt": "2023-01-01T01:00:00.000Z"
  }
}
```

### Community

#### POST /institutions/{institutionId}/forums
Create forum (Institution Admin).

**Request Body:**
```json
{
  "name": "General Discussion",
  "description": "General discussions about agriculture",
  "slug": "general-discussion",
  "category": "general"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "forumId": "uuid",
    "name": "General Discussion",
    "description": "General discussions about agriculture",
    "slug": "general-discussion",
    "category": "general",
    "postCount": 0,
    "memberCount": 0,
    "isActive": true,
    "displayOrder": 0,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Forum created successfully"
}
```

#### GET /institutions/{institutionId}/forums
Get forums by institution (All roles).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "forumId": "uuid",
      "name": "General Discussion",
      "description": "General discussions about agriculture",
      "slug": "general-discussion",
      "category": "general",
      "postCount": 15,
      "memberCount": 120,
      "isActive": true,
      "displayOrder": 0,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /institutions/{institutionId}/announcements
Create announcement (Institution Admin).

**Request Body:**
```json
{
  "title": "New Course Available",
  "content": "We're excited to announce our new course on sustainable farming practices."
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "announcementId": "uuid",
    "title": "New Course Available",
    "content": "We're excited to announce our new course on sustainable farming practices.",
    "createdBy": "uuid",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Announcement created successfully"
}
```

#### GET /institutions/{institutionId}/announcements
Get announcements by institution (All roles).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)
- `activeOnly` (boolean, optional): Whether to return only active announcements (default: true)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "announcementId": "uuid",
      "title": "New Course Available",
      "content": "We're excited to announce our new course on sustainable farming practices.",
      "createdBy": "uuid",
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /institutions/{institutionId}/chats
Create chatroom (Institution Admin).

**Request Body:**
```json
{
  "chatroomType": "topic_based",
  "name": "Sustainable Farming",
  "description": "Discussion about sustainable farming practices",
  "requireApproval": false
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "chatroomId": "uuid",
    "chatroomType": "topic_based",
    "name": "Sustainable Farming",
    "description": "Discussion about sustainable farming practices",
    "avatarUrl": null,
    "createdBy": "uuid",
    "memberCount": 0,
    "maxMembers": null,
    "requireApproval": false,
    "lastActivity": null,
    "status": "active",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Chatroom created successfully"
}
```

#### GET /institutions/{institutionId}/chats
Get chatrooms by institution (All roles).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "chatroomId": "uuid",
      "chatroomType": "topic_based",
      "name": "Sustainable Farming",
      "description": "Discussion about sustainable farming practices",
      "avatarUrl": null,
      "createdBy": "uuid",
      "memberCount": 15,
      "maxMembers": null,
      "requireApproval": false,
      "lastActivity": "2023-01-01T00:00:00.000Z",
      "status": "active",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### POST /institutions/{institutionId}/memberships
Create membership (Institution Admin).

**Request Body:**
```json
{
  "name": "Premium Access",
  "description": "Access to premium content and features",
  "price": 29.99,
  "durationMonths": 12
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "membershipId": "uuid",
    "name": "Premium Access",
    "description": "Access to premium content and features",
    "price": 29.99,
    "durationMonths": 12,
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Membership created successfully"
}
```

#### GET /institutions/{institutionId}/memberships
Get memberships by institution (All roles).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "membershipId": "uuid",
      "name": "Premium Access",
      "description": "Access to premium content and features",
      "price": 29.99,
      "durationMonths": 12,
      "isActive": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Marketplace

#### POST /marketplace/listings
Create marketplace listing (Instructor, Institution Admin, Super Admin).

**Request Body:**
```json
{
  "title": "Organic Seeds Pack",
  "description": "High-quality organic vegetable seeds",
  "price": 25.00,
  "currency": "USD",
  "categoryId": "uuid",
  "listingType": "product",
  "status": "active",
  "stockQuantity": 100,
  "isDigital": false,
  "thumbnailUrl": "https://example.com/seeds.jpg"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "listingId": "uuid",
    "title": "Organic Seeds Pack",
    "description": "High-quality organic vegetable seeds",
    "price": 25.00,
    "currency": "USD",
    "sellerId": "uuid",
    "institutionId": "uuid",
    "categoryId": "uuid",
    "listingType": "product",
    "status": "active",
    "stockQuantity": 100,
    "isDigital": false,
    "thumbnailUrl": "https://example.com/seeds.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Listing created successfully"
}
```

#### GET /marketplace/listings
Get marketplace listings (All roles).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)
- `category` (string, optional): Filter by category ID
- `institution` (string, optional): Filter by institution ID
- `status` (string, optional): Filter by status
- `type` (string, optional): Filter by listing type

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "listingId": "uuid",
      "title": "Organic Seeds Pack",
      "description": "High-quality organic vegetable seeds",
      "price": 25.00,
      "currency": "USD",
      "sellerId": "uuid",
      "institutionId": "uuid",
      "categoryId": "uuid",
      "listingType": "product",
      "status": "active",
      "stockQuantity": 100,
      "isDigital": false,
      "thumbnailUrl": "https://example.com/seeds.jpg",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### GET /marketplace/listings/{listingId}
Get listing by ID (All roles).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listingId": "uuid",
    "title": "Organic Seeds Pack",
    "description": "High-quality organic vegetable seeds",
    "price": 25.00,
    "currency": "USD",
    "sellerId": "uuid",
    "institutionId": "uuid",
    "categoryId": "uuid",
    "listingType": "product",
    "status": "active",
    "stockQuantity": 100,
    "isDigital": false,
    "thumbnailUrl": "https://example.com/seeds.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### PUT /marketplace/listings/{listingId}
Update listing (Instructor, Institution Admin, Super Admin).

**Request Body:**
```json
{
  "title": "Updated Seeds Pack",
  "price": 27.50,
  "status": "active"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "listingId": "uuid",
    "title": "Updated Seeds Pack",
    "description": "High-quality organic vegetable seeds",
    "price": 27.50,
    "currency": "USD",
    "sellerId": "uuid",
    "institutionId": "uuid",
    "categoryId": "uuid",
    "listingType": "product",
    "status": "active",
    "stockQuantity": 100,
    "isDigital": false,
    "thumbnailUrl": "https://example.com/seeds.jpg",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  },
  "message": "Listing updated successfully"
}
```

#### DELETE /marketplace/listings/{listingId}
Delete listing (Instructor, Institution Admin, Super Admin).

**Response (200):**
```json
{
  "success": true,
  "message": "Listing deleted successfully"
}
```

#### POST /marketplace/purchase/{listingId}
Purchase listing (Student/Farmer).

**Request Body:**
```json
{
  "quantity": 2,
  "shippingAddress": {
    "street": "123 Farm Road",
    "city": "Agriculture City",
    "country": "USA",
    "postalCode": "12345"
  },
  "paymentMethod": "credit_card"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "orderId": "uuid",
    "buyerId": "uuid",
    "listingId": "uuid",
    "sellerId": "uuid",
    "quantity": 2,
    "totalAmount": 55.00,
    "currency": "USD",
    "status": "pending",
    "paymentStatus": "pending",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  "message": "Purchase successful"
}
```

#### GET /marketplace/orders
Get user orders (All roles).

**Query Parameters:**
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 50)
- `status` (string, optional): Filter by order status

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "orderId": "uuid",
      "buyerId": "uuid",
      "listingId": "uuid",
      "sellerId": "uuid",
      "quantity": 2,
      "totalAmount": 55.00,
      "currency": "USD",
      "status": "completed",
      "paymentStatus": "paid",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### Error Responses

#### 400 Bad Request
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

#### 401 Unauthorized
```json
{
  "error": "Authentication required"
}
```

#### 403 Forbidden
```json
{
  "error": "Insufficient permissions. Required: super_admin, Got: student"
}
```

#### 404 Not Found
```json
{
  "error": "Institution not found"
}
```

#### 409 Conflict
```json
{
  "error": "User with this email already exists"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

All endpoints are subject to rate limiting:
- **Super Admin**: 50 requests per 15 minutes
- **Institution Admin**: 75 requests per 15 minutes
- **Instructor/Student/Farmer**: 100 requests per 15 minutes

## WebSocket Events

### Chat Events
- `message:new`: New message received
- `message:read`: Message read confirmation
- `user:joined`: User joined chatroom
- `user:left`: User left chatroom
- `typing:start`: User started typing
- `typing:stop`: User stopped typing

### Notification Events
- `notification:new`: New notification received
- `enrollment:completed`: Course enrollment completed
- `quiz:completed`: Quiz completed
- `certificate:issued`: Certificate issued

## File Upload

### Supported File Types
- **Videos**: MP4, AVI, MOV (max 500MB)
- **Documents**: PDF, DOC, DOCX (max 50MB)
- **Images**: JPG, PNG, GIF (max 10MB)
- **Audio**: MP3, WAV (max 100MB)

### Upload Endpoint
```
POST /api/upload
Content-Type: multipart/form-data
```

**Request Body:**
```
file: [binary file data]
type: [video|document|image|audio]
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://example.com/uploads/filename.ext",
    "thumbnailUrl": "https://example.com/uploads/thumbnails/filename.jpg",
    "fileSize": 50000000,
    "mimeType": "video/mp4"
  }
}
```

## Webhooks

### Clerk Webhooks
Endpoint: `/webhooks/clerk`

Events handled:
- `user.created`: New user registered
- `user.updated`: User information updated
- `user.deleted`: User deleted

### Payment Webhooks
Endpoint: `/webhooks/payments`

Events handled:
- `payment.succeeded`: Payment successful
- `payment.failed`: Payment failed
- `payment.refunded`: Payment refunded

## Health Check

### System Health
```
GET /health
```

**Response (200):**
```json
{
  "status": "healthy",
  "timestamp": "2023-01-01T00:00:00.000Z",
  "services": {
    "database": "healthy",
    "redis": "healthy",
    "storage": "healthy"
  },
  "systemMetrics": {
    "memoryUsage": {
      "used": 500000000,
      "total": 2000000000,
      "percentage": 25
    },
    "cpuUsage": 15.5,
    "uptime": 86400
  }
}
```

## Versioning

This is version 1 of the API. All endpoints are prefixed with `/api/v1`.

## Contact

For API support and questions:
- Email: api@farmlingo.com
- Documentation: https://docs.farmlingo.com
- Support: https://support.farmlingo.com